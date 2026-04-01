"use client"

import { useMemo } from "react"
import { Sun, Sparkles, Star, Moon } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useUserStore } from "@/store/userStore"
import { useTimelineData } from "@/hooks/use-timeline-data"
import { StreakHeader } from "./StreakHeader"
import { PathNode, PathConnector, type NodeState } from "./PathNode"
import { ReadinessGate } from "./ReadinessGate"
import { DailyQuests } from "./DailyQuests"
import { StreakCalendar } from "./StreakCalendar"

/** Determine which activities are completed today from timeline data */
function getTodayCompletions(days: { date: string; completedItems: { questId?: string; type: string }[] }[]) {
  const today = new Date().toISOString().split("T")[0]
  const todayData = days.find((d) => d.date === today)
  if (!todayData) return { morning: false, affirmation: false, session: false, evening: false }

  const completedIds = new Set(todayData.completedItems.map((i) => i.questId ?? i.type))
  return {
    morning: completedIds.has("morning_intention"),
    affirmation: completedIds.has("daily_affirmation"),
    session: completedIds.has("session") || todayData.completedItems.some((i) => i.type === "session"),
    evening: completedIds.has("evening_reflection"),
  }
}

function getNodeState(done: boolean, prevDone: boolean, isCurrent: boolean): NodeState {
  if (done) return "completed"
  if (isCurrent) return "current"
  return "locked"
}

function getEveningState(done: boolean, sessionDone: boolean): NodeState {
  if (done) return "completed"
  const hour = new Date().getHours()
  if (hour < 18) return "time-locked"
  if (sessionDone) return "current"
  return "locked"
}

/** Build an activity map for the calendar from timeline data */
function buildActivityMap(days: { date: string; completedItems: unknown[] }[]): Record<string, number> {
  const map: Record<string, number> = {}
  for (const day of days) {
    if (day.completedItems.length > 0) {
      map[day.date] = Math.min(day.completedItems.length, 4)
    }
  }
  return map
}

/** Get which days of the current week have activity */
function getCompletedWeekDays(days: { date: string; completedItems: unknown[] }[]): number[] {
  const now = new Date()
  const mondayOffset = (now.getDay() + 6) % 7
  const monday = new Date(now)
  monday.setDate(now.getDate() - mondayOffset)
  monday.setHours(0, 0, 0, 0)

  const result: number[] = []
  for (const day of days) {
    const d = new Date(day.date + "T12:00:00")
    if (d >= monday && day.completedItems.length > 0) {
      result.push((d.getDay() + 6) % 7)
    }
  }
  return result
}

export function PathView() {
  const { user, providerUserId } = useAuth()
  const xp = useUserStore((s) => s.xp)
  const { days, isLoading } = useTimelineData(user?.id ?? null, providerUserId)

  const completions = useMemo(() => getTodayCompletions(days), [days])
  const activityMap = useMemo(() => buildActivityMap(days), [days])
  const completedWeekDays = useMemo(() => getCompletedWeekDays(days), [days])
  const daysThisWeek = completedWeekDays.length

  // Calculate today's XP from completed activities
  const todayXP = useMemo(() => {
    let total = 0
    if (completions.morning) total += 50
    if (completions.affirmation) total += 5
    if (completions.session) total += 100
    if (completions.evening) total += 50
    return total
  }, [completions])

  // Determine node states
  const morningState = getNodeState(completions.morning, true, !completions.morning)
  const affirmationState = getNodeState(completions.affirmation, completions.morning, completions.morning && !completions.affirmation)
  const sessionState = getNodeState(completions.session, completions.affirmation, completions.morning && completions.affirmation && !completions.session)
  const eveningState = getEveningState(completions.evening, completions.session)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-dvh" style={{ background: "var(--app-bg, #FAF8F3)" }}>
        <div className="h-6 w-6 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-dvh pb-24" style={{ background: "var(--app-bg, #FAF8F3)" }}>
      {/* Main content: path + sidebar */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 pt-2 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Left: Path */}
        <div className="rounded-2xl border border-gray-200/60 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
          <StreakHeader todayXP={todayXP} dailyTarget={205} completedDays={completedWeekDays} />

          <div className="p-4 space-y-0">
            {/* Morning Check-in */}
            <PathNode
              title="Morning Check-in"
              subtitle="Set intention, assess readiness"
              icon={Sun}
              emoji="☀️"
              xp={50}
              state={morningState}
              href="/content/morning_intention?prompt=Start%20your%20day%20with%20intention.%20What%20are%20you%20focusing%20on%20today%3F&xp=50"
              duration="2-3 min · Light session"
            />

            <PathConnector locked={!completions.morning} />

            {/* Daily Affirmation */}
            <PathNode
              title="Daily Affirmation"
              subtitle="Reinforce current step principle"
              icon={Sparkles}
              emoji="✨"
              xp={5}
              state={affirmationState}
              href="/content/daily_affirmation?prompt=Write%20an%20affirmation%20that%20feels%20true%20for%20you%20today.&xp=5"
              duration="1-2 min · Light session"
              unlockLabel="Unlocks after Morning"
            />

            {/* Readiness Gate */}
            <ReadinessGate />

            {/* Transformation Session (larger node) */}
            <PathNode
              title="Transformation Session"
              subtitle="Deep coaching — teaches steps & principles"
              icon={Star}
              emoji="⭐"
              xp={100}
              state={sessionState}
              href="/phone"
              duration="15-30 min · Deep session"
              unlockLabel="Unlocks when ready"
              isMainSession
            />

            <PathConnector locked={!completions.session} />

            {/* Evening Check-in */}
            <PathNode
              title="Evening Check-in"
              subtitle="Reflect on patterns, close the day"
              icon={Moon}
              emoji="🌙"
              xp={50}
              state={eveningState}
              href="/content/evening_reflection?prompt=How%20did%20today%20go%3F%20What%20did%20you%20learn%20about%20yourself%3F&xp=50"
              duration="2-3 min · Light session"
              unlockLabel={new Date().getHours() < 18 ? "Available after 6 PM" : "Unlocks after Session"}
            />
          </div>
        </div>

        {/* Right: Sidebar (quests + calendar) */}
        <div className="space-y-4 lg:sticky lg:top-4">
          <DailyQuests
            morningDone={completions.morning}
            sessionDone={completions.session}
            todayXP={todayXP}
            daysThisWeek={daysThisWeek}
          />
          <StreakCalendar activityMap={activityMap} />
        </div>
      </div>
    </div>
  )
}
