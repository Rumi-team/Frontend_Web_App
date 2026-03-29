"use client"

import { AlertCircle, RefreshCw } from "lucide-react"
import { OnboardingButton } from "./OnboardingButton"

interface ErrorRetryProps {
  message?: string
  onRetry: () => void
  onSkip?: () => void
}

export function ErrorRetry({
  message = "Something went wrong. Please try again.",
  onRetry,
  onSkip,
}: ErrorRetryProps) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <AlertCircle className="h-12 w-12 text-white/40" />
      <p className="text-[15px] text-white/60">{message}</p>
      <div className="flex w-full max-w-xs flex-col gap-3">
        <OnboardingButton onClick={onRetry}>
          <RefreshCw className="mr-2 inline h-4 w-4" />
          Try again
        </OnboardingButton>
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="text-sm text-white/40 hover:text-white/60"
          >
            Skip this step
          </button>
        )}
      </div>
    </div>
  )
}
