"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ProgressiveChecklist } from "@/components/onboarding/shared/ProgressiveChecklist"

interface BreathingScreenProps {
  onComplete: () => void
}

const CHECKLIST_ITEMS = [
  "Creating your safe space",
  "Reviewing your preferences",
  "Setting intentions for this session",
]

export function BreathingScreen({ onComplete }: BreathingScreenProps) {
  const [showChecklist, setShowChecklist] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowChecklist(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex h-dvh flex-col items-center justify-center" style={{ background: "#FAF5EF" }}>
      {/* Soft radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(255,212,180,0.3) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-10">
        {!showChecklist ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="text-xl text-gray-500 font-serif tracking-wide"
          >
            take a deep breath
          </motion.p>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ProgressiveChecklist
              items={CHECKLIST_ITEMS}
              delayMs={800}
              onComplete={onComplete}
            />
          </motion.div>
        )}
      </div>
    </div>
  )
}
