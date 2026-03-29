"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { OnboardingButton } from "../shared"
import { useOnboardingStore } from "@/store/onboardingStore"

interface ThemeSelectionScreenProps {
  onNext: () => void
  onBack?: () => void
}

// Black/gold variants matching Rumi's brand aesthetic
const THEMES = [
  {
    id: "obsidian-gold",
    name: "Obsidian Gold",
    gradient: "from-[#0a0a00] via-[#141005] to-[#080800]",
    accent: "#FFD41A",
  },
  {
    id: "midnight-amber",
    name: "Midnight Amber",
    gradient: "from-[#0d0800] via-[#1a0f00] to-[#080500]",
    accent: "#F59E0B",
  },
  {
    id: "charcoal-honey",
    name: "Charcoal Honey",
    gradient: "from-[#0f0d08] via-[#1a1610] to-[#0a0905]",
    accent: "#FBBF24",
  },
  {
    id: "pure-black",
    name: "Pure Black",
    gradient: "from-[#080808] via-[#0a0a0a] to-[#050505]",
    accent: "#FFD41A",
  },
]

export function ThemeSelectionScreen({ onNext, onBack }: ThemeSelectionScreenProps) {
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
    <div className={cn("relative flex min-h-[100dvh] flex-col items-center justify-between bg-gradient-to-b px-6 py-12", theme.gradient)}>
      {onBack && (
        <button type="button" onClick={onBack} className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-white/50 hover:bg-white/5 hover:text-white/80">
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
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
