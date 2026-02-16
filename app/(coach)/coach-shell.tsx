"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { AuthProvider, useAuth } from "@/components/auth-provider"
import { AccessCodeGate } from "@/components/access-code-gate"
import { Button } from "@/components/ui/button"
import { Mic, BookOpen, LogOut, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface CoachShellProps {
  children: React.ReactNode
  authenticated: boolean
  hasAccess: boolean
}

export function CoachShell({ children, authenticated, hasAccess }: CoachShellProps) {
  return (
    <AuthProvider>
      <CoachShellInner authenticated={authenticated} hasAccess={hasAccess}>
        {children}
      </CoachShellInner>
    </AuthProvider>
  )
}

function CoachShellInner({
  children,
  authenticated,
  hasAccess,
}: CoachShellProps) {
  const { signInWithGoogle, signOut, isLoading, displayName } = useAuth()
  const pathname = usePathname()
  const [accessGranted, setAccessGranted] = useState(hasAccess)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
      </div>
    )
  }

  // Not authenticated — show sign-in
  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black p-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="space-y-4">
            <Image
              src="/rumi_logo.png"
              alt="Rumi"
              width={303}
              height={101}
              className="mx-auto h-12 w-auto"
            />
            <p className="text-gray-400">
              Sign in to start your coaching session
            </p>
          </div>
          <Button
            onClick={signInWithGoogle}
            className="h-12 w-full bg-white text-black hover:bg-gray-100 font-semibold"
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
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
          </Button>
        </div>
      </div>
    )
  }

  // Authenticated but no access code
  if (!accessGranted) {
    return <AccessCodeGate onActivated={() => setAccessGranted(true)} />
  }

  // Fully authenticated with access
  return (
    <div className="flex min-h-screen flex-col bg-black">
      {/* Top nav */}
      <nav className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
        <div className="flex items-center gap-1">
          <Link href="/coach">
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
          <Link href="/coach">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-gray-400 hover:text-white",
                pathname === "/coach" && "text-yellow-400 hover:text-yellow-300"
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
