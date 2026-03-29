"use client"

import { motion } from "framer-motion"
import { Shield, Heart, Lock, Eye } from "lucide-react"
import { OnboardingButton } from "../shared"

interface PrivacyScreenProps {
  onNext: () => void
}

const ITEMS = [
  { icon: Shield, title: "Your data is protected", desc: "Industry-standard encryption keeps your conversations private." },
  { icon: Heart, title: "Zero judgment", desc: "Rumi is here to support you, not evaluate you." },
  { icon: Lock, title: "You're in control", desc: "Delete your data at any time from settings." },
  { icon: Eye, title: "Private by design", desc: "Your sessions are never shared with third parties." },
]

export function PrivacyScreen({ onNext }: PrivacyScreenProps) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-between bg-[#080808] px-6 py-12">
      <div />

      <div className="w-full max-w-md">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 text-center text-2xl font-bold text-white"
        >
          Your privacy comes first
        </motion.h1>

        <div className="space-y-4">
          {ITEMS.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.15 }}
              className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFD41A]/10">
                <item.icon className="h-5 w-5 text-[#FFD41A]" />
              </div>
              <div>
                <h3 className="text-[15px] font-medium text-white">{item.title}</h3>
                <p className="mt-0.5 text-[13px] text-white/50">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
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
