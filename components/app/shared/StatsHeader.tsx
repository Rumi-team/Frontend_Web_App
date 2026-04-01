"use client"

import { useUserStore } from "@/store/userStore"
import { getLevelInfo } from "@/lib/levels"

export function StatsHeader() {
  const xp = useUserStore((s) => s.xp)
  const streak = useUserStore((s) => s.streak)
  const level = getLevelInfo(xp)

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-[#1A1A1A] border-b border-gray-800">
      <div className="flex items-center gap-3">
        {/* Streak */}
        <div className="flex items-center gap-1.5 bg-[#242424] rounded-full px-3 py-1">
          <span className="text-sm">🔥</span>
          <span className="text-sm font-bold text-[#FF6B35] font-mono tabular-nums">
            {streak}
          </span>
        </div>

        {/* XP */}
        <div className="flex items-center gap-1.5 bg-[#242424] rounded-full px-3 py-1">
          <span className="text-sm">⭐</span>
          <span className="text-sm font-bold text-[#FFD700] font-mono tabular-nums">
            {xp} XP
          </span>
        </div>
      </div>

      {/* Level badge */}
      <div className="flex items-center gap-1.5 bg-[#7B68EE]/20 rounded-full px-3 py-1">
        <span className="text-xs font-bold text-[#7B68EE]">
          Lv.{level.level}
        </span>
        <span className="text-xs text-gray-400 hidden sm:inline">
          {level.title}
        </span>
      </div>
    </div>
  )
}
