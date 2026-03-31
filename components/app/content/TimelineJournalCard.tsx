"use client"

import type { TimelineItem } from "@/hooks/use-timeline-data"
import { getQuestById } from "@/lib/constants/quests"

interface TimelineJournalCardProps {
  item: TimelineItem
}

export function TimelineJournalCard({ item }: TimelineJournalCardProps) {
  const time = new Date(item.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  const quest = item.questId ? getQuestById(item.questId) : null
  const Icon = quest?.icon

  return (
    <div className="flex gap-3">
      {/* Timeline dot */}
      <div className="flex flex-col items-center pt-1">
        <span className="text-xs text-gray-400 w-14 text-right">{time}</span>
        <div className="mt-1 h-2.5 w-2.5 rounded-full bg-green-500 flex-shrink-0" />
      </div>

      {/* Card */}
      <div className="flex-1 rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 text-gray-400" />}
            <span className="text-sm font-semibold text-gray-900">
              {item.questTitle ?? "Journal Entry"}
            </span>
          </div>
          <span className="text-xs text-gray-400">
            🌿 +{item.xpEarned ?? 0}
          </span>
        </div>
        {item.content && (
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
            {item.content}
          </p>
        )}
      </div>
    </div>
  )
}
