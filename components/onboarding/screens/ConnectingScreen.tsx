"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { WizardLayout, ProgressiveChecklist } from "../shared"

const STEPS = [
  "Connecting to your coach",
  "Loading your preferences",
  "Preparing your space",
  "Almost ready...",
]

export function ConnectingScreen() {
  const router = useRouter()

  const handleComplete = useCallback(async () => {
    // Mark onboarding complete
    try {
      await fetch("/api/onboarding/complete", { method: "POST" })
    } catch {
      // Silent fail — the cookie matters for UX, data is already saved
    }
    // Clear localStorage onboarding state
    localStorage.removeItem("rumi-onboarding")
    // Redirect to the coach
    router.push("/rumi")
  }, [router])

  return (
    <WizardLayout>
      <div />
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-center text-2xl font-bold text-white">
          Connecting...
        </h1>
        <ProgressiveChecklist items={STEPS} delayMs={700} onComplete={handleComplete} />
      </div>
      <div />
    </WizardLayout>
  )
}
