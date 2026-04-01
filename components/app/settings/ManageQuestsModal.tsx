"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useSettingsStore } from "@/store/settingsStore"
import { SegmentedControl } from "@/components/app/shared/SegmentedControl"
import { useState } from "react"
import { Check, Sparkles, Sun, Moon, Heart, BookOpen } from "lucide-react"

interface ManageQuestsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const QUESTS = [
  { id: "daily_affirmation", title: "Daily Affirmation", icon: Sparkles, xp: 5 },
  { id: "morning_intention", title: "Morning Intention", icon: Sun, xp: 50 },
  { id: "evening_reflection", title: "Evening Reflection", icon: Moon, xp: 50 },
  { id: "gratitude_checkin", title: "Gratitude Check-in", icon: Heart, xp: 25 },
  { id: "weekly_review", title: "Weekly Review", icon: BookOpen, xp: 100 },
]

export function ManageQuestsModal({ open, onOpenChange }: ManageQuestsModalProps) {
  const activeQuests = useSettingsStore((s) => s.activeQuests)
  const toggleQuest = useSettingsStore((s) => s.toggleQuest)
  const [filter, setFilter] = useState("all")

  const activeCount = QUESTS.filter((q) => activeQuests.includes(q.id)).length
  const inactiveCount = QUESTS.length - activeCount

  const filtered = QUESTS.filter((q) => {
    if (filter === "active") return activeQuests.includes(q.id)
    if (filter === "inactive") return !activeQuests.includes(q.id)
    return true
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl bg-white dark:bg-gray-900">
        <SheetHeader>
          <SheetTitle className="text-gray-900 dark:text-gray-100">Manage Quests</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <SegmentedControl
            options={[
              { value: "all", label: `All ${QUESTS.length}` },
              { value: "active", label: `Active ${activeCount}` },
              { value: "inactive", label: `Inactive ${inactiveCount}` },
            ]}
            value={filter}
            onChange={setFilter}
          />
        </div>
        <div className="mt-4 flex flex-col gap-2">
          {filtered.map((quest) => {
            const Icon = quest.icon
            const isActive = activeQuests.includes(quest.id)
            return (
              <button
                key={quest.id}
                onClick={() => toggleQuest(quest.id)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
                  isActive ? "bg-green-50" : "bg-gray-50"
                }`}
              >
                <Icon className="h-5 w-5 text-gray-500" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-800">{quest.title}</p>
                  <p className="text-xs text-gray-500">+{quest.xp} XP</p>
                </div>
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    isActive ? "bg-green-500" : "bg-gray-200"
                  }`}
                >
                  {isActive && <Check className="h-3.5 w-3.5 text-white" />}
                </div>
              </button>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
