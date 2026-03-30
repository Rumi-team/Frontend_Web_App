"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useUserStore } from "@/store/userStore"
import { useSettingsStore } from "@/store/settingsStore"
import { getLevelInfo } from "@/lib/levels"
import { Sparkles, Sun, Moon, Heart, BookOpen, Search, PenSquare } from "lucide-react"

interface Quest {
  id: string
  title: string
  prompt: string
  time: string
  xp: number
  icon: typeof Sparkles
  color: string
}

const ALL_QUESTS: Quest[] = [
  {
    id: "daily_affirmation",
    title: "Daily Affirmation",
    prompt: "Write an affirmation that feels true for you today. What strength or quality do you want to carry with you?",
    time: "3:03 PM",
    xp: 5,
    icon: Sparkles,
    color: "#D4C896",
  },
  {
    id: "morning_intention",
    title: "Morning Intention",
    prompt: "What is your intention for today? What one thing would make today meaningful?",
    time: "5:00 AM",
    xp: 50,
    icon: Sun,
    color: "#D4C896",
  },
  {
    id: "evening_reflection",
    title: "Evening Reflection",
    prompt: "Look back on your day. What went well? What surprised you? What are you grateful for?",
    time: "8:00 PM",
    xp: 50,
    icon: Moon,
    color: "#C8D4D8",
  },
  {
    id: "gratitude_checkin",
    title: "Gratitude Check-in",
    prompt: "Name three things you are grateful for right now. Be specific.",
    time: "12:00 PM",
    xp: 25,
    icon: Heart,
    color: "#D4C896",
  },
  {
    id: "weekly_review",
    title: "Weekly Review",
    prompt: "Reflect on your week. What patterns did you notice? What would you do differently?",
    time: "Sunday",
    xp: 100,
    icon: BookOpen,
    color: "#D4C896",
  },
]

export function QuestFeed() {
  const [search, setSearch] = useState("")
  const activeQuests = useSettingsStore((s) => s.activeQuests)
  const { streak, xp, wordCount } = useUserStore()
  const level = getLevelInfo(xp)

  const quests = useMemo(() => {
    return ALL_QUESTS
      .filter((q) => activeQuests.includes(q.id))
      .filter((q) => q.title.toLowerCase().includes(search.toLowerCase()))
  }, [activeQuests, search])

  return (
    <div className="flex flex-col min-h-full px-4 pt-6 pb-4" style={{ background: "#FAF8F3" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Today</h1>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>🔥 {streak}</span>
          <span>🌿 {level.level}</span>
          <span>📝 {wordCount}</span>
        </div>
      </div>

      {/* Open quests */}
      {quests.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            Open ({quests.length})
          </p>
          <div className="grid grid-cols-2 gap-3">
            {quests.map((quest) => {
              const Icon = quest.icon
              return (
                <Link
                  key={quest.id}
                  href={`/content/${quest.id}?prompt=${encodeURIComponent(quest.prompt)}&xp=${quest.xp}`}
                  className="flex flex-col gap-2 rounded-2xl p-4 transition-transform active:scale-[0.98]"
                  style={{ backgroundColor: quest.color }}
                >
                  <div className="flex items-center justify-between">
                    <Icon className="h-5 w-5 text-gray-700/60" />
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <span>{quest.time}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600/80">🌿 +{quest.xp}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 leading-tight">
                    {quest.title}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {quests.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 text-sm">No active quests. Enable some in Settings.</p>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search + compose */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2.5">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />
        </div>
        <Link
          href="/content/daily_affirmation?prompt=Write+freely+about+whatever+is+on+your+mind.&xp=5"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-white"
        >
          <PenSquare className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
