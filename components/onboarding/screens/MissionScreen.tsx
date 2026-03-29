"use client"

import { motion } from "framer-motion"
import { OnboardingButton } from "../shared"

interface MissionScreenProps {
  onNext: () => void
}

export function MissionScreen({ onNext }: MissionScreenProps) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-between bg-[#080808] px-6 py-12">
      <div />

      <div className="flex flex-col items-center gap-8">
        {/* Watercolor-style illustration placeholder */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex h-48 w-48 items-center justify-center rounded-full bg-gradient-to-br from-[#FFD41A]/20 to-[#D97706]/10"
        >
          <span className="text-6xl">🤝</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <h1 className="mb-4 text-3xl font-bold text-white">
            Everyone deserves
            <br />
            to be heard
          </h1>
          <p className="mx-auto max-w-xs text-[15px] leading-relaxed text-white/60">
            Rumi is your 24/7 transformational coach, here to help you grow,
            reflect, and build the life you want.
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="w-full max-w-sm"
      >
        <OnboardingButton onClick={onNext}>
          Begin Your Transformation
        </OnboardingButton>
      </motion.div>
    </div>
  )
}
