"use client"

import { OnboardingButton } from "./OnboardingButton"

interface ResumeInterstitialProps {
  currentStep: number
  totalSteps: number
  onResume: () => void
  onStartOver: () => void
}

export function ResumeInterstitial({
  currentStep,
  totalSteps,
  onResume,
  onStartOver,
}: ResumeInterstitialProps) {
  const percent = Math.round((currentStep / totalSteps) * 100)

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#080808] px-6">
      <div className="mb-8 text-center">
        <h1 className="mb-3 text-2xl font-bold text-white">Welcome back</h1>
        <p className="text-[15px] text-white/60">
          You were {percent}% through setting up your coach.
        </p>
      </div>

      <div className="mb-12 h-2 w-48 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[#FFD41A] transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <OnboardingButton onClick={onResume}>
          Continue where I left off
        </OnboardingButton>
        <OnboardingButton variant="secondary" onClick={onStartOver}>
          Start over
        </OnboardingButton>
      </div>
    </div>
  )
}
