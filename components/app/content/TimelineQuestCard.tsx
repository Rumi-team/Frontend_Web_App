"use client"

import Link from "next/link"
import type { Quest } from "@/lib/constants/quests"

interface TimelineQuestCardProps {
  quest: Quest
}

export function TimelineQuestCard({ quest }: TimelineQuestCardProps) {
  const Icon = quest.icon

  return (
    <Link
      href={`/content/${quest.id}?prompt=${encodeURIComponent(quest.prompt)}&xp=${quest.xp}`}
      className="flex flex-col gap-2 rounded-2xl p-4 transition-transform active:scale-[0.98]"
      style={{ backgroundColor: quest.color }}
    >
      <div className="flex items-center justify-between">
        <Icon className="h-5 w-5 text-gray-700" />
        <span className="text-xs text-gray-600">{quest.time}</span>
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-600">
        <span>🌿</span>
        <span>+{quest.xp}</span>
      </div>
      <p className="text-sm font-semibold text-gray-900">{quest.title}</p>
    </Link>
  )
}
