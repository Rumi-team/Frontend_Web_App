"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { KeyRound, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

interface AccessCodeGateProps {
  onActivated: () => void
}

export function AccessCodeGate({ onActivated }: AccessCodeGateProps) {
  const { signOut, user } = useAuth()
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/access-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Invalid code")
        return
      }

      onActivated()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400/10">
            <KeyRound className="h-8 w-8 text-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Enter Access Code</h1>
          <p className="text-sm text-gray-400">
            Rumi is currently invite-only. Enter your access code to get
            started.
          </p>
          {user?.email && (
            <p className="text-xs text-gray-600">
              Signed in as {user.email}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase())
              setError(null)
            }}
            placeholder="ENTER CODE"
            className="h-12 border-gray-700 bg-gray-900 text-center text-lg tracking-widest text-white placeholder:text-gray-600"
            maxLength={12}
            autoFocus
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button
            type="submit"
            disabled={isSubmitting || !code.trim()}
            className="h-12 w-full bg-yellow-400 text-black hover:bg-yellow-300 font-semibold"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Activate"
            )}
          </Button>

          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => signOut()}
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              Sign Out
            </button>
            <span className="text-gray-700">|</span>
            <a
              href="mailto:support@rumi.team"
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
