"use client"

import { useState, useEffect } from "react"
import { Lock } from "lucide-react"

interface DayLockedOverlayProps {
  completedDay: number
  cooldownRemainingHours: number
  unlockAt: string | null
  onContinueChat: () => void
}

export function DayLockedOverlay({
  completedDay,
  cooldownRemainingHours,
  unlockAt,
  onContinueChat,
}: DayLockedOverlayProps) {
  const [remainingText, setRemainingText] = useState("")

  useEffect(() => {
    function updateRemaining() {
      if (!unlockAt) {
        const hours = Math.floor(cooldownRemainingHours)
        const minutes = Math.round((cooldownRemainingHours - hours) * 60)
        setRemainingText(hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`)
        return
      }

      const unlockDate = new Date(unlockAt)
      const now = new Date()
      const diffMs = unlockDate.getTime() - now.getTime()

      if (diffMs <= 0) {
        setRemainingText("Ready now!")
        return
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60))
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      setRemainingText(hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`)
    }

    updateRemaining()
    const interval = setInterval(updateRemaining, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [unlockAt, cooldownRemainingHours])

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 px-8 text-center max-w-sm">
        {/* Lock icon with glow */}
        <div className="relative">
          <div
            className="absolute inset-0 rounded-full blur-xl"
            style={{ background: "radial-gradient(circle, rgba(250,204,21,0.2) 0%, transparent 70%)" }}
          />
          <Lock className="relative h-16 w-16" style={{ color: "rgb(250,204,21)" }} />
        </div>

        <h2 className="text-xl font-semibold text-white">
          You&apos;ve completed Section {completedDay}!
        </h2>

        <p className="text-gray-400 text-sm leading-relaxed">
          Your next session unlocks in{" "}
          <span className="text-yellow-400 font-medium">{remainingText}</span>.
          Take time to reflect on today&apos;s discoveries.
        </p>

        <button
          onClick={onContinueChat}
          className="mt-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all
            bg-white/10 hover:bg-white/20 text-white border border-white/10"
        >
          Continue chatting
        </button>

        <p className="text-xs text-gray-600 mt-1">
          Free conversation — no step progression
        </p>
      </div>
    </div>
  )
}
