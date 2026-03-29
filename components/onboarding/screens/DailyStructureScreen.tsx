"use client"

import { motion } from "framer-motion"
import { Sun, Moon, MessageCircle, Target, BookOpen, ChevronLeft } from "lucide-react"
import { OnboardingButton } from "../shared"

interface DailyStructureScreenProps {
  onNext: () => void
  onBack?: () => void
}

const QUESTS = [
  { icon: Sun, label: "Morning Intention", desc: "Set your focus for the day" },
  { icon: MessageCircle, label: "Check-in Session", desc: "Talk through what's on your mind" },
  { icon: Target, label: "Growth Exercise", desc: "A personalized activity for you" },
  { icon: BookOpen, label: "Reflection Prompt", desc: "Process what you've learned" },
  { icon: Moon, label: "Evening Reflection", desc: "Close the day with clarity" },
]

export function DailyStructureScreen({ onNext, onBack }: DailyStructureScreenProps) {
  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-between bg-[#080808] px-6 py-12">
      {onBack && (
        <button type="button" onClick={onBack} className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-white/50 hover:bg-white/5 hover:text-white/80">
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      <div />

      <div className="w-full max-w-md">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-2 text-center text-2xl font-bold text-white"
        >
          Your daily structure
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8 text-center text-[15px] text-white/50"
        >
          Rumi builds your day around these touchpoints.
        </motion.p>

        <div className="space-y-3">
          {QUESTS.map((quest, i) => (
            <motion.div
              key={quest.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFD41A]/10">
                <quest.icon className="h-5 w-5 text-[#FFD41A]" />
              </div>
              <div>
                <h3 className="text-[15px] font-medium text-white">{quest.label}</h3>
                <p className="text-[13px] text-white/50">{quest.desc}</p>
              </div>
              <div className="ml-auto text-[#FFD41A]">✓</div>
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
