"use client"

import type { TimelineDay as TimelineDayData } from "@/hooks/use-timeline-data"
import { TimelineQuestCard } from "./TimelineQuestCard"
import { TimelineSessionCard } from "./TimelineSessionCard"
import { TimelineJournalCard } from "./TimelineJournalCard"

interface TimelineDayProps {
  day: TimelineDayData
}

export function TimelineDay({ day }: TimelineDayProps) {
  const hasOpenQuests = day.openQuests.length > 0
  const hasCompleted = day.completedItems.length > 0

  if (!hasOpenQuests && !hasCompleted) return null

  return (
    <div>
      {/* Date header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{day.label}</h2>
      </div>
      <div className="border-b border-gray-200 dark:border-gray-700 mb-4" />

      {/* Open quests grid */}
      {hasOpenQuests && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Open ({day.openQuests.length})
          </p>
          <div className="grid grid-cols-2 gap-3">
            {day.openQuests.map((quest) => (
              <TimelineQuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        </div>
      )}

      {/* Completed items */}
      {hasCompleted && (
        <div className="mb-2">
          {hasOpenQuests && (
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Completed ({day.completedItems.length})
            </p>
          )}
          <div className="space-y-3">
            {day.completedItems.map((item) =>
              item.type === "session" ? (
                <TimelineSessionCard key={item.id} item={item} />
              ) : (
                <TimelineJournalCard key={item.id} item={item} />
              )
            )}
          </div>
        </div>
      )}
    </div>
  )
}
