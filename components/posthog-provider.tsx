"use client"

import posthog from "posthog-js"
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react"
import { useEffect, useRef, type ReactNode } from "react"

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || ""
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://r.rumi.team"

/** Initialise PostHog once (client-side only). */
function initPostHog() {
  if (typeof window === "undefined") return
  if (posthog.__loaded) return

  if (!POSTHOG_KEY) {
    console.warn("[PostHog] NEXT_PUBLIC_POSTHOG_KEY not set — analytics disabled")
    return
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    ui_host: "https://us.posthog.com",
    capture_pageview: false, // we fire manually for SPA route changes
    capture_pageleave: true,
    persistence: "localStorage+cookie",
    cross_subdomain_cookie: true,
    // Cross-domain: bootstrap on second domain via URL hash params
    bootstrap: getBootstrapFromUrl(),
  })
}

/**
 * Cross-domain bootstrap: when navigating from rumiagent.com → rumi.team
 * (or vice versa), the linking domain appends #ph_distinct_id=X&ph_session_id=Y.
 * We read those here so PostHog stitches the sessions together.
 */
function getBootstrapFromUrl(): { distinctID?: string; sessionID?: string } | undefined {
  if (typeof window === "undefined") return undefined
  const hash = window.location.hash
  if (!hash.includes("ph_distinct_id")) return undefined

  const params = new URLSearchParams(hash.slice(1))
  const distinctID = params.get("ph_distinct_id") || undefined
  const sessionID = params.get("ph_session_id") || undefined

  // Clean up the hash so it doesn't linger in the URL
  if (distinctID) {
    params.delete("ph_distinct_id")
    params.delete("ph_session_id")
    const remaining = params.toString()
    window.history.replaceState(null, "", window.location.pathname + window.location.search + (remaining ? `#${remaining}` : ""))
  }

  return distinctID ? { distinctID, sessionID } : undefined
}

/** Build a cross-domain link URL with PostHog IDs in the hash. */
export function buildCrossDomainLink(targetUrl: string): string {
  if (typeof window === "undefined" || !posthog.__loaded) return targetUrl

  const distinctId = posthog.get_distinct_id()
  const sessionId = posthog.get_session_id()
  if (!distinctId) return targetUrl

  const url = new URL(targetUrl)
  const hashParams = new URLSearchParams(url.hash.slice(1))
  hashParams.set("ph_distinct_id", distinctId)
  if (sessionId) hashParams.set("ph_session_id", sessionId)
  url.hash = hashParams.toString()
  return url.toString()
}

// ── Provider ──

export function PostHogProvider({ children }: { children: ReactNode }) {
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      initPostHog()
      initialized.current = true
    }
  }, [])

  if (!POSTHOG_KEY) return <>{children}</>

  return <PHProvider client={posthog}>{children}</PHProvider>
}

// ── Identify hook: call when user signs in ──

export function usePostHogIdentify(
  providerUserId: string | null,
  displayName: string | null,
  email?: string | null,
) {
  const ph = usePostHog()
  const identified = useRef(false)

  useEffect(() => {
    if (!ph || !providerUserId || identified.current) return

    ph.identify(providerUserId, {
      name: displayName ?? undefined,
      email: email ?? undefined,
    })
    identified.current = true
  }, [ph, providerUserId, displayName, email])
}

// ── Event helpers ──

export function captureEvent(event: string, properties?: Record<string, unknown>) {
  if (typeof window !== "undefined" && posthog.__loaded) {
    posthog.capture(event, properties)
  }
}
