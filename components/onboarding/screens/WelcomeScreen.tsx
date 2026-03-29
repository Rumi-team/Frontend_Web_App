"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { OnboardingButton } from "../shared"

interface WelcomeScreenProps {
  onNext: () => void
}

export function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-between bg-[#080808] px-6 py-12">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center text-3xl font-bold text-white"
      >
        Welcome to Rumi
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="relative my-8"
      >
        <Image
          src="/RumiMascot.png"
          alt="Rumi"
          width={240}
          height={240}
          className="drop-shadow-[0_0_40px_rgba(255,212,26,0.2)]"
          priority
        />
      </motion.div>

      {/* Pagination dots */}
      <div className="mb-6 flex gap-2">
        <div className="h-2 w-2 rounded-full bg-[#FFD41A]" />
        <div className="h-2 w-2 rounded-full bg-white/20" />
        <div className="h-2 w-2 rounded-full bg-white/20" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-sm"
      >
        <OnboardingButton onClick={onNext}>
          Begin Your Journey
        </OnboardingButton>
      </motion.div>
    </div>
  )
}
