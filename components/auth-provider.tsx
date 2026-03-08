"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase-auth-browser"
import type { User, Session } from "@supabase/supabase-js"

interface AuthContextValue {
  user: User | null
  session: Session | null
  isLoading: boolean
  isSigningIn: boolean
  oauthError: string | null
  providerUserId: string | null
  displayName: string | null
  signInWithGoogle: () => Promise<void>
  signInWithApple: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>
  signUpWithEmail: (email: string, password: string) => Promise<{ error: string | null }>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  updateDisplayName: (name: string) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * After sign-in, upsert user_identities and auto-match access codes.
 */
async function handlePostSignIn(user: User) {
  try {
    const res = await fetch("/api/auth/post-signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    })
    if (!res.ok) {
      console.error("Post sign-in error:", await res.text())
    }
  } catch (err) {
    console.error("Post sign-in fetch failed:", err)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createSupabaseBrowserClient())
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [oauthError, setOauthError] = useState<string | null>(null)
  const [displayNameOverride, setDisplayNameOverride] = useState<string | null>(null)
  const postSignInDone = useRef(false)
  const codeExchangeDone = useRef(false)

  // Safety: reset isSigningIn on mount — if user navigated back from OAuth
  // page or a previous attempt left it stuck, clear it after a short delay.
  // Also acts as a global timeout: if any sign-in takes > 15s, reset.
  const signingInTimerRef = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => {
    const t = setTimeout(() => setIsSigningIn(false), 3000)
    return () => clearTimeout(t)
  }, [])
  useEffect(() => {
    if (isSigningIn) {
      signingInTimerRef.current = setTimeout(() => {
        console.warn("[Auth] Sign-in timed out after 15s, resetting state")
        setIsSigningIn(false)
        setOauthError("Sign-in timed out. Please try again.")
      }, 15000)
    } else if (signingInTimerRef.current) {
      clearTimeout(signingInTimerRef.current)
    }
    return () => {
      if (signingInTimerRef.current) clearTimeout(signingInTimerRef.current)
    }
  }, [isSigningIn])

  useEffect(() => {
    // Handle PKCE code exchange: when Google/Apple redirects back with ?code=,
    // exchange it for a session using the browser client (which has the code_verifier)
    const params = new URLSearchParams(window.location.search)
    const code = params.get("code")

    if (code && !codeExchangeDone.current) {
      codeExchangeDone.current = true
      // Clean URL immediately to prevent re-processing
      window.history.replaceState(null, "", window.location.pathname)

      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          console.error("PKCE code exchange error:", error)
          setOauthError("Sign-in failed. Please try again.")
          setIsLoading(false)
          setIsSigningIn(false)
        }
        // onAuthStateChange will fire SIGNED_IN and handle the rest
      })
    }

    // Check for OAuth error in URL (e.g. ?error=access_denied&error_description=...)
    const urlError = params.get("error_description") || params.get("error")
    if (urlError) {
      setOauthError(urlError)
      window.history.replaceState(null, "", window.location.pathname)
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)

      // On sign-in, upsert user_identities + auto-match access code
      if (event === "SIGNED_IN" && session?.user && !postSignInDone.current) {
        postSignInDone.current = true
        handlePostSignIn(session.user)

        // Clean up the URL hash if present (implicit flow fallback)
        if (window.location.hash.includes("access_token")) {
          window.history.replaceState(null, "", window.location.pathname)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const signInWithGoogle = useCallback(async () => {
    try {
      setOauthError(null)
      setIsSigningIn(true)
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (typeof window !== "undefined" ? window.location.origin : "")
      const redirectTo = `${siteUrl}/login`
      console.log("[Auth] Google OAuth redirectTo:", redirectTo)
      const result = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      })
      if (result.error) {
        console.error("OAuth error:", result.error)
        setOauthError(result.error.message)
        setIsSigningIn(false)
        return
      }
      if (result.data?.url) {
        window.location.href = result.data.url
      } else {
        console.error("Google OAuth: no redirect URL returned")
        setOauthError("Failed to start Google sign-in. Please try again.")
        setIsSigningIn(false)
      }
    } catch (error) {
      console.error("Failed to sign in with Google:", error)
      setOauthError("Failed to connect to Google. Please try again.")
      setIsSigningIn(false)
    }
  }, [supabase])

  const signInWithApple = useCallback(async () => {
    try {
      setOauthError(null)
      setIsSigningIn(true)
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (typeof window !== "undefined" ? window.location.origin : "")
      const redirectTo = `${siteUrl}/login`
      console.log("[Auth] Apple OAuth redirectTo:", redirectTo)
      const result = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      })
      if (result.error) {
        console.error("Apple OAuth error:", result.error)
        setOauthError(result.error.message)
        setIsSigningIn(false)
        return
      }
      if (result.data?.url) {
        window.location.href = result.data.url
      } else {
        console.error("Apple OAuth: no redirect URL returned")
        setOauthError("Failed to start Apple sign-in. Please try again.")
        setIsSigningIn(false)
      }
    } catch (error) {
      console.error("Failed to sign in with Apple:", error)
      setOauthError("Failed to connect to Apple. Please try again.")
      setIsSigningIn(false)
    }
  }, [supabase])

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      setIsSigningIn(true)
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      setIsSigningIn(false)
      if (error) return { error: error.message }
      return { error: null }
    } catch (err) {
      setIsSigningIn(false)
      return { error: "Sign in failed. Please try again." }
    }
  }, [supabase])

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    try {
      setIsSigningIn(true)
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (typeof window !== "undefined" ? window.location.origin : "")
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${siteUrl}/login` },
      })
      setIsSigningIn(false)
      if (error) return { error: error.message }
      return { error: null }
    } catch (err) {
      setIsSigningIn(false)
      return { error: "Sign up failed. Please try again." }
    }
  }, [supabase])

  const resetPassword = useCallback(async (email: string) => {
    try {
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (typeof window !== "undefined" ? window.location.origin : "")
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/login`,
      })
      if (error) return { error: error.message }
      return { error: null }
    } catch {
      return { error: "Password reset failed." }
    }
  }, [supabase])

  const signOut = useCallback(async () => {
    postSignInDone.current = false
    codeExchangeDone.current = false
    setDisplayNameOverride(null)
    await supabase.auth.signOut()
    // Force navigate to sign-in by reloading — ensures server sees no session
    window.location.href = "/rumi"
  }, [supabase])

  const updateDisplayName = useCallback((name: string) => {
    setDisplayNameOverride(name)
  }, [])

  // Resolve provider user ID: prefer Apple/Google identity sub over email identity
  // iOS stores sessions with Apple sub, so we must match that on web
  const providerUserId = (() => {
    if (!user) return null
    const identities = user.identities ?? []
    // Prefer Apple identity (matches iOS session data)
    const apple = identities.find((i) => i.provider === "apple")
    if (apple?.identity_data?.sub) return apple.identity_data.sub as string
    // Try Google identity
    const google = identities.find((i) => i.provider === "google")
    if (google?.identity_data?.sub) return google.identity_data.sub as string
    // Fall back to user_metadata.sub (preserves original provider sub)
    if (user.user_metadata?.sub) return user.user_metadata.sub as string
    // Last resort: first identity
    return (identities[0]?.identity_data?.sub as string) ?? identities[0]?.id ?? null
  })()

  const displayName =
    displayNameOverride ??
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email?.split("@")[0] ??
    null

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isSigningIn,
        oauthError,
        providerUserId,
        displayName,
        signInWithGoogle,
        signInWithApple,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        signOut,
        updateDisplayName,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
