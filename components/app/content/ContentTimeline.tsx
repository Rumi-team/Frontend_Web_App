"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useUserStore } from "@/store/userStore"
import { useTimelineData } from "@/hooks/use-timeline-data"
import { TimelineDay } from "./TimelineDay"
import { Search, Pen } from "lucide-react"
import Link from "next/link"

export function ContentTimeline() {
  const { user, providerUserId } = useAuth()
  const streak = useUserStore((s) => s.streak)
  const xp = useUserStore((s) => s.xp)
  const wordCount = useUserStore((s) => s.wordCount)
  const [search, setSearch] = useState("")

  const { days, isLoading } = useTimelineData(user?.id ?? null, providerUserId)

  // Filter days by search term
  const filteredDays = search.trim()
    ? days.map((day) => ({
        ...day,
        openQuests: day.openQuests.filter((q) =>
          q.title.toLowerCase().includes(search.toLowerCase())
        ),
        completedItems: day.completedItems.filter(
          (item) =>
            (item.topic?.toLowerCase().includes(search.toLowerCase())) ||
            (item.questTitle?.toLowerCase().includes(search.toLowerCase())) ||
            (item.content?.toLowerCase().includes(search.toLowerCase())) ||
            (item.summary?.toLowerCase().includes(search.toLowerCase()))
        ),
      })).filter((day) => day.openQuests.length > 0 || day.completedItems.length > 0)
    : days

  return (
    <div className="flex flex-col min-h-dvh pb-24" style={{ background: "var(--app-bg, #FAF8F3)" }}>
      {/* Stats bar */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <div />
        <div className="flex items-center gap-4 text-sm">
          <span>🔥 {streak}</span>
          <span>🌿 {xp}</span>
          <span>📝 {wordCount.toLocaleString()}</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 px-4 space-y-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
          </div>
        ) : filteredDays.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            {search ? "No matches found" : "Your coaching timeline will appear here"}
          </div>
        ) : (
          filteredDays.map((day) => <TimelineDay key={day.date} day={day} />)
        )}
      </div>

      {/* Search + compose bar */}
      <div className="fixed bottom-20 left-0 right-0 px-4 pb-2">
        <div className="flex items-center gap-2 max-w-2xl mx-auto">
          <div className="flex-1 flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2.5">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none"
            />
          </div>
          <Link
            href={`/content/daily_affirmation?prompt=${encodeURIComponent("Free write — what's on your mind?")}&xp=5`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-white flex-shrink-0"
          >
            <Pen className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
