"use client"

import { useUserStore } from "@/store/userStore"

const DAYS = ["M", "T", "W", "T", "F", "S", "S"]

interface StreakHeaderProps {
  todayXP: number
  dailyTarget: number
  completedDays: number[] // 0-6, where 0 = Monday
}

export function StreakHeader({ todayXP, dailyTarget, completedDays }: StreakHeaderProps) {
  const streak = useUserStore((s) => s.streak)
  const todayDow = (new Date().getDay() + 6) % 7 // 0=Mon

  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200/60 dark:border-white/10">
      <div className="flex items-center gap-4">
        {/* Streak */}
        <div className="flex items-center gap-1.5 text-sm font-bold text-gray-900 dark:text-gray-100">
          <span className="text-base">🔥</span>
          {streak || 1} day streak
        </div>

        {/* Week dots */}
        <div className="flex items-center gap-1">
          {DAYS.map((day, i) => {
            const isDone = completedDays.includes(i)
            const isToday = i === todayDow
            return (
              <div
                key={i}
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold transition-colors ${
                  isDone
                    ? "bg-amber-500 text-white"
                    : isToday
                      ? "border-2 border-amber-500 text-gray-900 dark:text-gray-100"
                      : "bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-gray-500"
                }`}
              >
                {day}
              </div>
            )
          })}
        </div>
      </div>

      {/* XP today */}
      <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-lg">
        {todayXP} / {dailyTarget} XP
      </div>
    </div>
  )
}
