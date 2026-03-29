"use client"

import { useEffect, useRef } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase-auth-browser"

/**
 * Thin client component that handles:
 * 1. Redirecting authenticated users from / to /rumi
 * 2. Exchanging ?code= PKCE params (OAuth callback)
 *
 * Middleware already handles both cases, but this is a safety net
 * for edge cases where middleware doesn't catch the redirect.
 */
export function AuthRedirect() {
  const checked = useRef(false)

  useEffect(() => {
    if (checked.current) return
    checked.current = true

    const params = new URLSearchParams(window.location.search)
    const code = params.get("code")
    const supabase = createSupabaseBrowserClient()

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (!error) {
          window.location.href = "/rumi"
        }
      })
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        window.location.href = "/rumi"
      }
    })
  }, [])

  return null
}
