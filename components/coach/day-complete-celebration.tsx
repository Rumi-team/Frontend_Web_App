"use client"

import { useEffect, useState } from "react"
import { PartyPopper } from "lucide-react"

interface DayCompleteCelebrationProps {
  completedDay: number
  totalDays: number
  onDismiss: () => void
}

const DAY_THEMES: Record<number, { title: string; subtitle: string }> = {
  1: {
    title: "Section 1 Complete — REVEAL",
    subtitle: "You've begun to see the filters you couldn't see before.",
  },
  2: {
    title: "Section 2 Complete — DISMANTLE",
    subtitle: "You've started to take apart the machinery that runs your life.",
  },
  3: {
    title: "Section 3 Complete — TRANSFORM",
    subtitle: "You've created new possibilities from nothing. The real work begins.",
  },
}

export function DayCompleteCelebration({
  completedDay,
  totalDays,
  onDismiss,
}: DayCompleteCelebrationProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setVisible(true))

    // Auto-dismiss after 6 seconds
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 400)
    }, 6000)

    return () => clearTimeout(timer)
  }, [onDismiss])

  const theme = DAY_THEMES[completedDay] ?? {
    title: `Section ${completedDay} Complete!`,
    subtitle: "Great progress on your transformation journey.",
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-400
        ${visible ? "opacity-100" : "opacity-0"}`}
      style={{ background: "radial-gradient(ellipse at center, rgba(250,204,21,0.08) 0%, rgba(0,0,0,0.92) 70%)" }}
    >
      <div
        className={`flex flex-col items-center gap-5 px-8 text-center transform transition-all duration-500
          ${visible ? "translate-y-0 scale-100" : "translate-y-8 scale-95"}`}
      >
        {/* Celebration icon */}
        <div className="relative animate-bounce">
          <PartyPopper className="h-14 w-14" style={{ color: "rgb(250,204,21)" }} />
        </div>

        <h2 className="text-2xl font-bold text-white">{theme.title}</h2>

        <p className="text-gray-300 text-sm max-w-xs leading-relaxed">
          {theme.subtitle}
        </p>

        {/* Day progress dots */}
        <div className="flex items-center gap-3 mt-2">
          {Array.from({ length: totalDays }).map((_, i) => (
            <div
              key={i}
              className={`h-3 w-3 rounded-full transition-all duration-300 ${
                i < completedDay
                  ? "bg-yellow-400 shadow-lg shadow-yellow-400/30"
                  : "bg-gray-700"
              }`}
            />
          ))}
        </div>

        <p className="text-xs text-gray-500 mt-3">
          {completedDay < totalDays
            ? "See you tomorrow for the next chapter"
            : "All sessions complete — SUSTAIN steps unlocked!"}
        </p>

        <button
          onClick={() => {
            setVisible(false)
            setTimeout(onDismiss, 400)
          }}
          className="mt-2 px-5 py-2 rounded-full text-xs font-medium
            bg-white/10 hover:bg-white/15 text-gray-300 border border-white/5 transition-all"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
