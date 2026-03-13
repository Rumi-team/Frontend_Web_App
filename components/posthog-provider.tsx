"use client"

import posthog from "posthog-js"
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react"
import { useEffect, useRef, type ReactNode } from "react"

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

// ── Provider (init handled by instrumentation-client.ts) ──

export function PostHogProvider({ children }: { children: ReactNode }) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return <>{children}</>

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
