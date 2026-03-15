"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/**
 * Invisible client component that auto-refreshes session data.
 * Triggers once on mount (catches summaries generated after initial load)
 * and again every 30s while the page is visible.
 */
export function SessionRefresh() {
  const router = useRouter()

  useEffect(() => {
    // Initial refresh after 5s — session summaries from the background thread
    // are typically ready within a few seconds of arriving on this page
    const initial = setTimeout(() => router.refresh(), 5000)

    // Poll every 30s while page is open
    const interval = setInterval(() => router.refresh(), 30_000)

    return () => {
      clearTimeout(initial)
      clearInterval(interval)
    }
  }, [router])

  return null
}
