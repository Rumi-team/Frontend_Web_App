"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { OnboardingButton } from "../shared"
import { useOnboardingStore } from "@/store/onboardingStore"

interface ThemeSelectionScreenProps {
  onNext: () => void
}

const THEMES = [
  {
    id: "warm-gold",
    name: "Warm Gold",
    gradient: "from-[#1a1400] via-[#2d2200] to-[#0a0800]",
    accent: "#FFD41A",
  },
  {
    id: "deep-navy",
    name: "Deep Navy",
    gradient: "from-[#0a0f1a] via-[#0d1b2a] to-[#070b14]",
    accent: "#60A5FA",
  },
  {
    id: "forest-green",
    name: "Forest",
    gradient: "from-[#0a1a0f] via-[#0d2a15] to-[#070f0a]",
    accent: "#34D399",
  },
  {
    id: "twilight",
    name: "Twilight",
    gradient: "from-[#1a0a1a] via-[#2a0d2a] to-[#0f070f]",
    accent: "#A78BFA",
  },
]

export function ThemeSelectionScreen({ onNext }: ThemeSelectionScreenProps) {
  const { selectedTheme, setField } = useOnboardingStore()
  const [current, setCurrent] = useState(
    THEMES.findIndex((t) => t.id === selectedTheme) >= 0
      ? THEMES.findIndex((t) => t.id === selectedTheme)
      : 0
  )

  function handleNext() {
    setField("selectedTheme", THEMES[current].id)
    onNext()
  }

  const theme = THEMES[current]

  return (
    <div className={cn("flex min-h-[100dvh] flex-col items-center justify-between bg-gradient-to-b px-6 py-12", theme.gradient)}>
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-2xl font-bold text-white"
      >
        Choose your theme
      </motion.h1>

      {/* Theme preview cards */}
      <div className="flex w-full max-w-md gap-3 overflow-x-auto pb-4 snap-x snap-mandatory">
        {THEMES.map((t, i) => (
          <motion.button
            key={t.id}
            type="button"
            onClick={() => setCurrent(i)}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "flex min-w-[140px] snap-center flex-col items-center gap-3 rounded-2xl border p-6 transition-all",
              current === i
                ? "border-white/30 bg-white/10"
                : "border-white/5 bg-white/5"
            )}
          >
            <div
              className={cn("h-20 w-20 rounded-xl bg-gradient-to-b", t.gradient)}
              style={{ boxShadow: `0 0 20px ${t.accent}20` }}
            />
            <span className="text-[14px] font-medium text-white">{t.name}</span>
          </motion.button>
        ))}
      </div>

      {/* Pagination dots */}
      <div className="flex gap-2">
        {THEMES.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-2 w-2 rounded-full transition-colors",
              current === i ? "bg-white" : "bg-white/20"
            )}
          />
        ))}
      </div>

      <div className="w-full max-w-sm">
        <OnboardingButton onClick={handleNext}>Select theme</OnboardingButton>
      </div>
    </div>
  )
}
