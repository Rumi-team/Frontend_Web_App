"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { ErrorRetry } from "../shared"

interface AnalyzingScreenProps {
  onComplete: () => void
  onSkip: () => void
}

export function AnalyzingScreen({ onComplete, onSkip }: AnalyzingScreenProps) {
  const [error, setError] = useState(false)

  const startAnalysis = useCallback(() => {
    setError(false)
    const timeout = setTimeout(() => {
      onComplete()
    }, 3000)
    return () => clearTimeout(timeout)
  }, [onComplete])

  useEffect(() => {
    return startAnalysis()
  }, [startAnalysis])

  if (error) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#080808] px-6">
        <ErrorRetry onRetry={() => startAnalysis()} onSkip={onSkip} />
      </div>
    )
  }

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#080808]">
      {/* Animated node network */}
      <div className="relative mb-12 h-48 w-48">
        {Array.from({ length: 7 }).map((_, i) => {
          const angle = (i / 7) * Math.PI * 2
          const r = 60 + (i % 2) * 20
          const cx = 96 + Math.cos(angle) * r
          const cy = 96 + Math.sin(angle) * r

          return (
            <motion.div
              key={i}
              className="absolute h-4 w-4 rounded-full bg-[#FFD41A]"
              style={{ left: cx - 8, top: cy - 8 }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.25,
              }}
            />
          )
        })}
        {/* Center node */}
        <motion.div
          className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFD41A]"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-[17px] font-medium text-white/70"
      >
        Understanding what matters to you...
      </motion.p>
    </div>
  )
}
