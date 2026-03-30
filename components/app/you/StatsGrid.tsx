"use client"

import { useUserStore } from "@/store/userStore"

export function StatsGrid() {
  const streak = useUserStore((s) => s.streak)
  const wordCount = useUserStore((s) => s.wordCount)
  const sessionsCompleted = useUserStore((s) => s.sessionsCompleted)

  const moneySaved = sessionsCompleted * 5

  const stats = [
    { label: "Streak", value: streak, icon: "🔥" },
    { label: "Words", value: wordCount, icon: "📝" },
    { label: "Saved", value: `$${moneySaved}`, icon: "💚" },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col items-center gap-1 rounded-2xl bg-gray-50 py-4"
        >
          <div className="flex items-center gap-1">
            <span>{stat.icon}</span>
            <span className="text-lg font-bold text-gray-900">{stat.value}</span>
          </div>
          <span className="text-xs text-gray-500">{stat.label}</span>
        </div>
      ))}
    </div>
  )
}
