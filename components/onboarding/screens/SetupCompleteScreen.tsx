"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { OnboardingButton } from "../shared"

interface SetupCompleteScreenProps {
  onNext: () => void
}

export function SetupCompleteScreen({ onNext }: SetupCompleteScreenProps) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-between bg-[#080808] px-6 py-12">
      <div />

      <div className="flex flex-col items-center gap-6">
        {/* Animated checkmark with confetti */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          className="flex h-24 w-24 items-center justify-center rounded-full bg-[#FFD41A]"
        >
          <Check className="h-12 w-12 text-white" />
        </motion.div>

        {/* Confetti particles */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2
          const distance = 80 + Math.random() * 40
          const colors = ["#FFD41A", "#F59E0B", "#D97706", "#FBBF24", "#FDE68A"]
          return (
            <motion.div
              key={i}
              className="absolute h-2 w-2 rounded-full"
              style={{ backgroundColor: colors[i % colors.length] }}
              initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance - 40,
                scale: [0, 1, 0.5],
              }}
              transition={{ duration: 1.2, delay: 0.4 + i * 0.05 }}
            />
          )
        })}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <h1 className="mb-2 text-3xl font-bold text-white">
            You&apos;re all set!
          </h1>
          <p className="text-[15px] text-white/60">
            Your coach is ready. Let&apos;s start your first session.
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="w-full max-w-sm"
      >
        <OnboardingButton onClick={onNext}>
          Start Your First Session
        </OnboardingButton>
      </motion.div>
    </div>
  )
}
