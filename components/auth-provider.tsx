"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase-auth-browser"
import type { User, Session } from "@supabase/supabase-js"

interface AuthContextValue {
  user: User | null
  session: Session | null
  isLoading: boolean
  isSigningIn: boolean
  providerUserId: string | null
  displayName: string | null
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createSupabaseBrowserClient())
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSigningIn, setIsSigningIn] = useState(false)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const signInWithGoogle = useCallback(async () => {
    try {
      setIsSigningIn(true)
      console.log("Starting Google OAuth flow...")
      console.log("Redirect URL:", `${window.location.origin}/api/auth/callback`)
      const result = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })
      console.log("OAuth result:", result)
      if (result.error) {
        console.error("OAuth error:", result.error)
      }
    } catch (error) {
      console.error("Failed to sign in with Google:", error)
    } finally {
      setIsSigningIn(false)
    }
  }, [supabase])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [supabase])

  const providerUserId =
    user?.identities?.[0]?.identity_data?.sub ??
    user?.identities?.[0]?.id ??
    null

  const displayName =
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
        providerUserId,
        displayName,
        signInWithGoogle,
        signOut,
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
