"use client"

import { useAuth } from "@/components/auth-provider"
import { useUserStore } from "@/store/userStore"
import { getLevelInfo } from "@/lib/levels"

const LEVEL_NAMES: Record<number, string> = {
  1: "Seeker", 2: "Seeker",
  3: "Explorer", 4: "Explorer",
  5: "Awakener", 6: "Awakener",
  7: "Transformer", 8: "Transformer",
  9: "Transformer", 10: "Transformer",
}

export function ProfileCard() {
  const { displayName } = useAuth()
  const xp = useUserStore((s) => s.xp)
  const streak = useUserStore((s) => s.streak)
  const sessionsCompleted = useUserStore((s) => s.sessionsCompleted)
  const level = getLevelInfo(xp)
  const initial = (displayName || "U").charAt(0).toUpperCase()
  const tierName = LEVEL_NAMES[level.level] || "Seeker"

  const progressPercent = level.xpToNext > 0
    ? ((xp - (level.xp - level.xpToNext)) / level.xpToNext) * 100
    : 100

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar */}
      <div
        className="flex h-22 w-22 items-center justify-center rounded-full text-4xl"
        style={{
          width: 88, height: 88,
          background: "linear-gradient(135deg, #F5C518, #FF6B35)",
          border: "4px solid #F5C518",
          boxShadow: "0 0 0 4px rgba(245,197,24,0.2)",
        }}
      >
        <span className="font-bold text-[#1A1A1A]">{initial}</span>
      </div>
      <h2
        className="text-xl font-extrabold text-white"
        style={{ fontFamily: "var(--font-nunito, Nunito), sans-serif" }}
      >
        {displayName || "User"}
      </h2>
      <span className="text-sm font-bold text-[#7B68EE]">
        ⭐ {tierName} — Level {level.level}
      </span>

      {/* Stats row */}
      <div className="flex justify-center gap-6 w-full py-3 border-y border-gray-800">
        <div className="text-center">
          <div className="text-2xl font-extrabold text-[#FF6B35]" style={{ fontFamily: "var(--font-nunito, Nunito), sans-serif" }}>{streak}</div>
          <div className="text-[10px] text-[#9E9E9E] uppercase tracking-wider font-semibold">Day Streak</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-extrabold text-[#FFD700]" style={{ fontFamily: "var(--font-nunito, Nunito), sans-serif" }}>{xp}</div>
          <div className="text-[10px] text-[#9E9E9E] uppercase tracking-wider font-semibold">Total XP</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-extrabold text-[#4CAF50]" style={{ fontFamily: "var(--font-nunito, Nunito), sans-serif" }}>{sessionsCompleted}</div>
          <div className="text-[10px] text-[#9E9E9E] uppercase tracking-wider font-semibold">Sessions</div>
        </div>
      </div>

      {/* XP progress bar */}
      <div className="w-full px-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-[#7B68EE]">Level {level.level}</span>
          <span className="text-xs text-[#9E9E9E] font-mono tabular-nums">
            {xp} / {level.xp + (level.xpToNext || 0)} XP
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-[#242424] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(progressPercent, 100)}%`,
              background: "linear-gradient(90deg, #F5C518, #FFD700)",
            }}
          />
        </div>
        <p className="mt-1 text-xs text-[#9E9E9E]">
          {level.xpToNext > 0
            ? `${level.xpToNext} XP to ${level.nextTitle}`
            : "Max level reached!"}
        </p>
      </div>
    </div>
  )
}
