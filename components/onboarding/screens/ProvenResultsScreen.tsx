"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { TrendingUp, DollarSign, Clock, Users } from "lucide-react"
import { OnboardingButton } from "../shared"

interface ProvenResultsScreenProps {
  onNext: () => void
}

function AnimatedStat({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const start = target * 0.4
    const duration = 1500
    const startTime = Date.now()

    function animate() {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(start + (target - start) * eased))

      if (progress < 1) requestAnimationFrame(animate)
    }

    const timeout = setTimeout(animate, 300)
    return () => clearTimeout(timeout)
  }, [target])

  return (
    <span>
      {value}
      {suffix}
    </span>
  )
}

export function ProvenResultsScreen({ onNext }: ProvenResultsScreenProps) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-between bg-[#080808] px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-full border border-[#FFD41A]/30 bg-[#FFD41A]/10 px-4 py-1.5 text-[13px] font-semibold uppercase tracking-wider text-[#FFD41A]"
      >
        Proven Results
      </motion.div>

      <div className="grid w-full max-w-sm grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-5"
        >
          <TrendingUp className="mb-3 h-6 w-6 text-[#FFD41A]" />
          <div className="text-2xl font-bold text-white">
            <AnimatedStat target={89} suffix="%" />
          </div>
          <p className="mt-1 text-[13px] text-white/50">avg. improvement</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-5"
        >
          <DollarSign className="mb-3 h-6 w-6 text-[#FFD41A]" />
          <div className="text-2xl font-bold text-white">
            <AnimatedStat target={20} suffix="x" />
          </div>
          <p className="mt-1 text-[13px] text-white/50">more affordable</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-5"
        >
          <Clock className="mb-3 h-6 w-6 text-[#FFD41A]" />
          <div className="text-2xl font-bold text-white">24/7</div>
          <p className="mt-1 text-[13px] text-white/50">always available</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-5"
        >
          <Users className="mb-3 h-6 w-6 text-[#FFD41A]" />
          <div className="text-2xl font-bold text-white">
            <AnimatedStat target={10} suffix="K+" />
          </div>
          <p className="mt-1 text-[13px] text-white/50">sessions completed</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="w-full max-w-sm"
      >
        <OnboardingButton onClick={onNext}>Continue</OnboardingButton>
      </motion.div>
    </div>
  )
}
