"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase-auth-browser"
import { useSettingsStore } from "@/store/settingsStore"
import { ALL_QUESTS, type Quest } from "@/lib/constants/quests"
import type { SessionSummary } from "@/lib/types/library"

export interface TimelineItem {
  id: string
  date: string // YYYY-MM-DD
  type: "session" | "journal"
  timestamp: string // ISO
  // Session fields
  topic?: string
  summary?: string
  depthScore?: number
  durationMinutes?: number
  messageCount?: number
  // Journal fields
  questId?: string
  questTitle?: string
  content?: string
  wordCount?: number
  xpEarned?: number
}

export interface TimelineDay {
  date: string
  label: string // "Today" | "Yesterday" | "Mon, Mar 31"
  openQuests: Quest[]
  completedItems: TimelineItem[]
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00")
  const now = new Date()
  const today = now.toISOString().split("T")[0]
  const yesterday = new Date(now.getTime() - 86400000).toISOString().split("T")[0]

  if (dateStr === today) return "Today"
  if (dateStr === yesterday) return "Yesterday"

  const thisYear = now.getFullYear()
  const dateYear = date.getFullYear()

  if (dateYear === thisYear) {
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  }
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })
}

interface UseTimelineDataReturn {
  days: TimelineDay[]
  isLoading: boolean
  refetch: () => void
}

export function useTimelineData(
  userId: string | null,
  providerUserId: string | null,
): UseTimelineDataReturn {
  const [days, setDays] = useState<TimelineDay[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const activeQuests = useSettingsStore((s) => s.activeQuests)
  // Use ref to avoid activeQuests in useCallback deps (prevents infinite re-render loop)
  const activeQuestsRef = useRef(activeQuests)
  activeQuestsRef.current = activeQuests

  const load = useCallback(async () => {
    setIsLoading(true)
    try {

    // Even without user IDs, show today's open quests
    if (!userId && !providerUserId) {
      const today = new Date().toISOString().split("T")[0]
      const todayQuests = activeQuestsRef.current
        .map((id) => ALL_QUESTS.find((q) => q.id === id))
        .filter((q): q is Quest => q !== undefined)
      setDays([{
        date: today,
        label: "Today",
        openQuests: todayQuests,
        completedItems: [],
      }])
      setIsLoading(false)
      return
    }

    const supabase = createSupabaseBrowserClient()

    // Fetch sessions and journal entries in parallel
    const [sessionsRes, journalRes] = await Promise.all([
      providerUserId
        ? supabase
            .from("session_summaries")
            .select("session_id, topic, summary, session_started_at, duration_minutes, message_count, depth_score")
            .eq("provider_user_id", providerUserId)
            .order("session_started_at", { ascending: false })
            .limit(50)
        : Promise.resolve({ data: [] as SessionSummary[], error: null }),

      userId
        ? supabase
            .from("journal_entries")
            .select("id, quest_id, content, word_count, xp_earned, created_at")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(50)
        : Promise.resolve({ data: [] as Record<string, unknown>[], error: null }),
    ])

    const items: TimelineItem[] = []

    // Map sessions to timeline items
    if (sessionsRes.data) {
      for (const s of sessionsRes.data as SessionSummary[]) {
        const ts = s.session_started_at
        if (!ts) continue
        items.push({
          id: `session-${s.session_id}`,
          date: ts.split("T")[0],
          type: "session",
          timestamp: ts,
          topic: s.topic,
          summary: s.summary ?? undefined,
          depthScore: s.depth_score,
          durationMinutes: s.duration_minutes,
          messageCount: s.message_count,
        })
      }
    }

    // Map journal entries to timeline items
    if (journalRes.data) {
      for (const j of journalRes.data) {
        const ts = j.created_at as string
        if (!ts) continue
        const quest = ALL_QUESTS.find((q) => q.id === j.quest_id)
        items.push({
          id: `journal-${j.id}`,
          date: ts.split("T")[0],
          type: "journal",
          timestamp: ts,
          questId: j.quest_id as string,
          questTitle: quest?.title ?? (j.quest_id as string),
          content: j.content as string,
          wordCount: j.word_count as number,
          xpEarned: j.xp_earned as number,
        })
      }
    }

    // Group by date
    const grouped = new Map<string, TimelineItem[]>()
    for (const item of items) {
      const existing = grouped.get(item.date) ?? []
      existing.push(item)
      grouped.set(item.date, existing)
    }

    // Build timeline days
    const today = new Date().toISOString().split("T")[0]
    const todayQuests = activeQuestsRef.current
      .map((id) => ALL_QUESTS.find((q) => q.id === id))
      .filter((q): q is Quest => q !== undefined)

    // Ensure today appears even with no completed items
    if (!grouped.has(today)) {
      grouped.set(today, [])
    }

    const sortedDates = Array.from(grouped.keys()).sort((a, b) => b.localeCompare(a))

    const timelineDays: TimelineDay[] = sortedDates.map((date) => {
      const completedItems = (grouped.get(date) ?? []).sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )

      // Only show open quests for today
      const isToday = date === today
      const completedQuestIds = completedItems
        .filter((i) => i.type === "journal")
        .map((i) => i.questId)
      const openQuests = isToday
        ? todayQuests.filter((q) => !completedQuestIds.includes(q.id))
        : []

      return {
        date,
        label: formatDateLabel(date),
        openQuests,
        completedItems,
      }
    })

    setDays(timelineDays)
    } catch (err) {
      console.error("Failed to load timeline data:", err)
      // Show today with no data rather than infinite spinner
      const today = new Date().toISOString().split("T")[0]
      const todayQuests = activeQuestsRef.current
        .map((id) => ALL_QUESTS.find((q) => q.id === id))
        .filter((q): q is Quest => q !== undefined)
      setDays([{ date: today, label: "Today", openQuests: todayQuests, completedItems: [] }])
    } finally {
      setIsLoading(false)
    }
  }, [userId, providerUserId])

  useEffect(() => {
    load()
  }, [load])

  return { days, isLoading, refetch: load }
}
