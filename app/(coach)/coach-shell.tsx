"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { AuthProvider, useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Mic, BookOpen, LogOut, Loader2, Eye, EyeOff, Mail, Lock, Settings, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

interface CoachShellProps {
  children: React.ReactNode
  authenticated: boolean
}

export function CoachShell({ children, authenticated }: CoachShellProps) {
  return (
    <AuthProvider>
      <CoachShellInner authenticated={authenticated}>
        {children}
      </CoachShellInner>
    </AuthProvider>
  )
}

/* ─── Sign-In Page ─── */
function SignInPage() {
  const {
    signInWithGoogle,
    signInWithApple,
    signInWithEmail,
    signUpWithEmail,
    isSigningIn,
    oauthError,
  } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signUpSuccess, setSignUpSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError("Please enter your email address.")
      return
    }
    if (!password.trim()) {
      setError("Please enter your password.")
      return
    }
    if (isSignUp && password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    if (isSignUp) {
      const result = await signUpWithEmail(email, password)
      if (result.error) {
        setError(result.error)
      } else {
        setSignUpSuccess(true)
      }
    } else {
      const result = await signInWithEmail(email, password)
      if (result.error) {
        setError(result.error)
      }
    }
  }

  if (signUpSuccess) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-black overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-yellow-500/5 blur-[120px]" />
        </div>

        <div className="relative z-10 w-full max-w-md px-6 text-center space-y-8">
          <Image
            src="/rumi_logo.png"
            alt="Rumi"
            width={303}
            height={101}
            className="mx-auto h-14 w-auto"
          />
          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-8">
            <Mail className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
            <p className="text-gray-400 text-lg">
              We sent a confirmation link to <span className="text-white font-medium">{email}</span>.
              Click it to activate your account.
            </p>
          </div>
          <button
            onClick={() => { setSignUpSuccess(false); setIsSignUp(false) }}
            className="text-yellow-400 hover:text-yellow-300 text-lg font-medium transition-colors"
          >
            Back to sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-black overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-yellow-500/[0.03] blur-[150px]" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-yellow-900/[0.02] to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-10">
          <Image
            src="/rumi_logo.png"
            alt="Rumi"
            width={303}
            height={101}
            className="mx-auto h-16 w-auto mb-6"
          />
          <h1 className="text-3xl font-bold text-white mb-2">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-gray-500 text-lg">
            {isSignUp
              ? "Start your transformation journey"
              : "Sign in to continue your journey"}
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full h-14 pl-12 pr-4 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white text-lg placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/30 transition-all"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignUp ? "At least 6 characters" : "Your password"}
                  className="w-full h-14 pl-12 pr-14 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white text-lg placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/30 transition-all"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <p className="text-red-400 text-sm px-1">{error}</p>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSigningIn}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold text-lg hover:from-yellow-400 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30"
            >
              {isSigningIn ? (
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              ) : (
                isSignUp ? "Create Account" : "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.06]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 text-gray-600 uppercase tracking-wider text-xs" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>or</span>
            </div>
          </div>

          {/* OAuth error */}
          {oauthError && (
            <p className="text-red-400 text-sm px-1 text-center">{oauthError}</p>
          )}

          {/* Social sign-in buttons */}
          <div className="space-y-3">
            {/* Google */}
            <button
              onClick={signInWithGoogle}
              disabled={isSigningIn}
              className="flex items-center justify-center gap-3 w-full h-14 rounded-xl bg-white hover:bg-gray-100 text-gray-800 font-semibold text-lg disabled:opacity-50 transition-all"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>

            {/* Apple */}
            <button
              onClick={signInWithApple}
              disabled={isSigningIn}
              className="flex items-center justify-center gap-3 w-full h-14 rounded-xl bg-black hover:bg-gray-900 border border-gray-700 text-white font-semibold text-lg disabled:opacity-50 transition-all"
            >
              <svg className="h-5 w-5" viewBox="0 0 814 1000" fill="white">
                <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.3-164-39.3c-76.5 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.5 135.4-317.3 269-317.3 70.1 0 128.4 46.4 172.5 46.4 42.8 0 109.6-49 192.5-49 30.8 0 108.2 2.6 168.5 80.9zm-126.7-94.7c-18.7-22.5-48.4-39.4-73.7-39.4-2.8 0-5.8.3-8.3.6 2.5 29.4 18.7 59.5 39.9 80.9 19.4 19.4 46.4 38.2 76.2 42.9-2.9-30.4-19.5-62-34.1-85z"/>
              </svg>
              Continue with Apple
            </button>

          </div>
        </div>

        {/* Toggle sign-in / sign-up */}
        <p className="text-center mt-8 text-gray-500 text-base">
          {isSignUp ? (
            <>
              Already have an account?{" "}
              <button
                onClick={() => { setIsSignUp(false); setError(null) }}
                className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors"
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              New to Rumi?{" "}
              <button
                onClick={() => { setIsSignUp(true); setError(null) }}
                className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors"
              >
                Create an account
              </button>
            </>
          )}
        </p>

        <Link
          href="/"
          className="flex items-center justify-center gap-3 w-full h-14 rounded-xl bg-transparent hover:bg-white/[0.03] border border-gray-700 text-gray-300 font-semibold text-base transition-all mt-6"
        >
          Return to Landing Page
        </Link>

      </div>
    </div>
  )
}

/* ─── Shell Inner ─── */
function CoachShellInner({
  children,
  authenticated,
}: CoachShellProps) {
  const { user, signOut, isLoading, displayName } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  // If the server rendered as unauthenticated but the client has a session
  // (happens with implicit OAuth flow), reload to let the server see the session.
  // If no client session either, redirect to /login as safety net.
  const isE2ETesting =
    process.env.NEXT_PUBLIC_E2E_TESTING === "true" &&
    process.env.NODE_ENV === "development"

  useEffect(() => {
    if (isE2ETesting) return
    if (!authenticated && user) {
      router.refresh()
    } else if (!authenticated && !user && !isLoading) {
      window.location.href = "/login"
    }
  }, [authenticated, user, isLoading, router, isE2ETesting])

  if (!isE2ETesting && (isLoading || !authenticated)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
      </div>
    )
  }

  const isCoachPage = pathname === "/rumi"

  // Fully authenticated with access
  // On /rumi route, skip nav for fullscreen orb experience
  if (isCoachPage) {
    return (
      <div className="flex min-h-screen flex-col bg-black">
        <main className="h-screen">{children}</main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-black">
      {/* Top nav */}
      <nav className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
        <div className="flex items-center gap-1">
          <Link href="/rumi">
            <Image
              src="/rumi_logo.png"
              alt="Rumi"
              width={303}
              height={101}
              className="h-6 w-auto"
            />
          </Link>
        </div>

        <div className="flex items-center gap-1">
          <Link href="/rumi">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-gray-400 hover:text-white",
                pathname === "/rumi" && "text-yellow-400 hover:text-yellow-300"
              )}
            >
              <Mic className="mr-1.5 h-4 w-4" />
              Coach
            </Button>
          </Link>
          <Link href="/library">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-gray-400 hover:text-white",
                pathname?.startsWith("/library") &&
                  "text-yellow-400 hover:text-yellow-300"
              )}
            >
              <BookOpen className="mr-1.5 h-4 w-4" />
              Library
            </Button>
          </Link>
          <Link href="/chat">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-gray-400 hover:text-white",
                pathname?.startsWith("/chat") && "text-yellow-400 hover:text-yellow-300"
              )}
            >
              <MessageSquare className="mr-1.5 h-4 w-4" />
              Chat
            </Button>
          </Link>
          <Link href="/settings">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-gray-400 hover:text-white",
                pathname?.startsWith("/settings") &&
                  "text-yellow-400 hover:text-yellow-300"
              )}
            >
              <Settings className="mr-1.5 h-4 w-4" />
              Settings
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {displayName && (
            <span className="text-xs text-gray-500 hidden sm:inline">
              {displayName}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="text-gray-500 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1">{children}</main>
    </div>
  )
}
