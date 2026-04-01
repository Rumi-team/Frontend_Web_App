"use client"

import { Check } from "lucide-react"
import { useUserStore } from "@/store/userStore"

interface QuestItem {
  label: string
  emoji: string
  bgClass: string
  current: number
  target: number
  fillClass: string
}

interface DailyQuestsProps {
  morningDone: boolean
  sessionDone: boolean
  todayXP: number
  daysThisWeek: number
}

export function DailyQuests({ morningDone, sessionDone, todayXP, daysThisWeek }: DailyQuestsProps) {
  const quests: QuestItem[] = [
    {
      label: "Complete morning routine",
      emoji: "☀️",
      bgClass: "bg-orange-50 dark:bg-orange-500/10",
      current: morningDone ? 1 : 0,
      target: 1,
      fillClass: "bg-green-500",
    },
    {
      label: "Do a transformation session",
      emoji: "⭐",
      bgClass: "bg-amber-50 dark:bg-amber-500/10",
      current: sessionDone ? 1 : 0,
      target: 1,
      fillClass: "bg-amber-500",
    },
    {
      label: "Earn 100 XP today",
      emoji: "💎",
      bgClass: "bg-green-50 dark:bg-green-500/10",
      current: Math.min(todayXP, 100),
      target: 100,
      fillClass: "bg-amber-500",
    },
    {
      label: "Practice 5 days this week",
      emoji: "🔥",
      bgClass: "bg-red-50 dark:bg-red-500/10",
      current: Math.min(daysThisWeek, 5),
      target: 5,
      fillClass: "bg-orange-500",
    },
  ]

  return (
    <div className="rounded-2xl border border-gray-200/60 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200/60 dark:border-white/10">
        <span className="text-base">⚡</span>
        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">Daily Quests</span>
      </div>
      <div className="px-3 py-2">
        {quests.map((q, i) => {
          const done = q.current >= q.target
          return (
            <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-100/80 dark:border-white/5 last:border-0">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm ${q.bgClass}`}>
                {q.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-gray-900 dark:text-gray-100 mb-1">{q.label}</div>
                <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${q.fillClass}`}
                    style={{ width: `${Math.min((q.current / q.target) * 100, 100)}%` }}
                  />
                </div>
              </div>
              {done ? (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 flex-shrink-0">
                  <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                </div>
              ) : (
                <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 flex-shrink-0">
                  {q.current}/{q.target}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
