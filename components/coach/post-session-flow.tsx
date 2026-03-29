"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Flame } from "lucide-react"
import { ProgressiveChecklist, OnboardingButton } from "@/components/onboarding/shared"

type PostSessionStep = "generating" | "summary" | "streak"

interface PostSessionFlowProps {
  /** Called when the user dismisses the post-session flow */
  onDismiss: () => void
}

const GENERATION_STEPS = [
  "Reviewing your conversation",
  "Identifying key themes",
  "Building your personal plan",
  "Preparing recommendations",
]

/**
 * Post-first-session flow (screens 030-032 from the onboarding spec).
 * Shown after the user's FIRST coaching session completes.
 * This is NOT part of the onboarding wizard — it's triggered by session completion.
 */
export function PostSessionFlow({ onDismiss }: PostSessionFlowProps) {
  const [step, setStep] = useState<PostSessionStep>("generating")
  const [plan, setPlan] = useState({ summary: "", focusArea: "" })

  // Fetch personalized plan (mock for now)
  useEffect(() => {
    if (step === "generating") {
      fetch("/api/onboarding")
        .then((r) => r.json())
        .then(() => {
          setPlan({
            summary:
              "Based on what you shared, your primary focus area is managing daily stress and building consistent habits. You've shown strong self-awareness.",
            focusArea: "Clarify what I want help with",
          })
        })
        .catch(() => {
          setPlan({
            summary: "Great first session. Let's build on what you shared.",
            focusArea: "Continue exploring",
          })
        })
    }
  }, [step])

  const handleGenerationComplete = useCallback(() => {
    setStep("summary")
  }, [])

  if (step === "generating") {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#080808] px-6">
        <h1 className="mb-8 text-center text-2xl font-bold text-white">
          Creating your plan...
        </h1>
        <ProgressiveChecklist
          items={GENERATION_STEPS}
          delayMs={700}
          onComplete={handleGenerationComplete}
        />
      </div>
    )
  }

  if (step === "summary") {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-between bg-[#080808] px-6 py-12">
        <div />

        <div className="w-full max-w-md">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 text-center text-2xl font-bold text-white"
          >
            Your personal plan
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 text-[15px] leading-relaxed text-white/70"
          >
            {plan.summary}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-[#FFD41A]/20 bg-[#FFD41A]/5 p-5"
          >
            <p className="text-[13px] font-medium uppercase tracking-wider text-[#FFD41A]">
              Focus Area
            </p>
            <p className="mt-2 text-[17px] font-semibold text-white">
              {plan.focusArea}
            </p>
          </motion.div>
        </div>

        <div className="flex w-full max-w-sm gap-3">
          <OnboardingButton variant="secondary" onClick={onDismiss}>
            Share
          </OnboardingButton>
          <OnboardingButton onClick={() => setStep("streak")}>
            Let&apos;s work on this
          </OnboardingButton>
        </div>
      </div>
    )
  }

  // Streak dashboard
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-between bg-[#080808] px-6 py-12">
      <div />

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#FFD41A] bg-[#FFD41A]/10">
          <Flame className="h-12 w-12 text-[#FFD41A]" />
        </div>
        <h1 className="text-4xl font-bold text-white">1 day</h1>
        <p className="text-[15px] text-white/50">You&apos;ve started your journey!</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-sm"
      >
        <OnboardingButton onClick={onDismiss}>Let&apos;s go</OnboardingButton>
      </motion.div>
    </div>
  )
}
