"use client"

import { motion } from "framer-motion"
import { User, Sliders } from "lucide-react"
import { OnboardingButton } from "../shared"

interface GettingToKnowYouScreenProps {
  onNext: () => void
}

export function GettingToKnowYouScreen({ onNext }: GettingToKnowYouScreenProps) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-between bg-[#080808] px-6 py-12">
      <div />

      <div className="flex flex-col items-center gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex h-24 w-24 items-center justify-center rounded-full bg-white/5"
        >
          <User className="h-10 w-10 text-white/40" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center text-2xl font-bold text-white"
        >
          Let&apos;s get to know you
        </motion.h1>

        {/* Stepper */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-3"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFD41A] text-[13px] font-bold text-white">
              1
            </div>
            <span className="text-[14px] font-medium text-white">Learn about you</span>
          </div>
          <div className="h-px w-8 bg-white/20" />
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[13px] font-bold text-white/40">
              2
            </div>
            <span className="text-[14px] text-white/40">Configure your coach</span>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-sm"
      >
        <OnboardingButton onClick={onNext}>Let&apos;s begin</OnboardingButton>
      </motion.div>
    </div>
  )
}
