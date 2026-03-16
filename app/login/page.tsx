"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { createSupabaseBrowserClient } from "@/lib/supabase-auth-browser"

function LoginForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const searchParams = useSearchParams()
  const codeExchangeDone = useRef(false)

  // Persist ref param across OAuth redirect
  useEffect(() => {
    const ref = searchParams.get("ref")
    if (ref) {
      localStorage.setItem("rumi_invite_ref", ref)
    }
  }, [searchParams])

  useEffect(() => {
    const err = searchParams.get("error")
    if (err) setError(decodeURIComponent(err))
  }, [searchParams])

  // Handle OAuth code exchange: when Google/Apple redirects back with ?code=
  useEffect(() => {
    const code = searchParams.get("code")
    if (!code || codeExchangeDone.current) return
    codeExchangeDone.current = true

    setLoading(true)
    const supabase = createSupabaseBrowserClient()
    supabase.auth.exchangeCodeForSession(code).then(async ({ error }) => {
      if (error) {
        // Middleware may have already exchanged this code — check for existing session
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          // Session exists — middleware got it first, proceed normally
          window.location.href = "/rumi"
          return
        }
        console.error("PKCE code exchange error:", error)
        setError("Sign-in failed. Please try again.")
        setLoading(false)
      } else {
        // Auto-redeem invite ref code if present
        const ref = localStorage.getItem("rumi_invite_ref")
        if (ref) {
          localStorage.removeItem("rumi_invite_ref")
          try {
            await fetch("/api/access-code", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code: ref }),
            })
          } catch {
            // Non-blocking — user can still manually verify
          }
        }

        // Post sign-in tracking (login_count, user_identities)
        try {
          await fetch("/api/auth/post-signin", { method: "POST" })
        } catch {
          // Non-blocking
        }

        // Session established — hard redirect so server sees the cookie
        window.location.href = "/rumi"
      }
    })
  }, [searchParams])

  async function signInWithGoogle() {
    setLoading(true)
    setError("")
    window.history.replaceState({}, "", "/login")
    const supabase = createSupabaseBrowserClient()
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (typeof window !== "undefined" ? window.location.origin : "")
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${siteUrl}/login`,
        skipBrowserRedirect: true,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    if (data?.url) window.location.href = data.url
  }

  async function signInWithApple() {
    setLoading(true)
    setError("")
    window.history.replaceState({}, "", "/login")
    const supabase = createSupabaseBrowserClient()
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (typeof window !== "undefined" ? window.location.origin : "")
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${siteUrl}/login`,
        skipBrowserRedirect: true,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    if (data?.url) window.location.href = data.url
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div
        className="rounded-2xl p-8 w-full max-w-sm space-y-6"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex flex-col items-center gap-3">
          <Image src="/rumi_logo.png" alt="Rumi" width={80} height={80} className="w-20 h-auto" />
          <p className="text-gray-300 text-base font-medium">Sign in to continue</p>
        </div>

        {error && (
          <div className="bg-red-400/10 border border-red-400/20 rounded-lg p-3">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="flex items-center justify-center gap-3 w-full h-14 rounded-xl bg-white hover:bg-gray-100 text-gray-800 font-semibold text-base disabled:opacity-50 transition-all"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {loading ? "Redirecting..." : "Continue with Google"}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.06]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 text-gray-600 uppercase tracking-wider" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>or</span>
            </div>
          </div>

          <button
            onClick={signInWithApple}
            disabled={loading}
            className="flex items-center justify-center gap-3 w-full h-14 rounded-xl bg-black hover:bg-gray-900 border border-gray-700 text-white font-semibold text-base disabled:opacity-50 transition-all"
          >
            <svg className="h-5 w-5" viewBox="0 0 814 1000" fill="white">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.3-164-39.3c-76.5 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.5 135.4-317.3 269-317.3 70.1 0 128.4 46.4 172.5 46.4 42.8 0 109.6-49 192.5-49 30.8 0 108.2 2.6 168.5 80.9zm-126.7-94.7c-18.7-22.5-48.4-39.4-73.7-39.4-2.8 0-5.8.3-8.3.6 2.5 29.4 18.7 59.5 39.9 80.9 19.4 19.4 46.4 38.2 76.2 42.9-2.9-30.4-19.5-62-34.1-85z" />
            </svg>
            {loading ? "Redirecting..." : "Continue with Apple"}
          </button>
        </div>

        <a
          href="/"
          className="block text-center text-sm text-gray-500 hover:text-gray-300 transition-colors mt-4"
        >
          Return to Landing Page
        </a>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-gray-400">Loading...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
