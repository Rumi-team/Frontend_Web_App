"use client"

import { useMemo } from "react"
import { Sun, Sparkles, Star, Moon, Lock, Check, Trophy, Gift, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { useUserStore } from "@/store/userStore"
import { useTimelineData } from "@/hooks/use-timeline-data"
import { StreakHeader } from "./StreakHeader"
import { DailyQuests } from "./DailyQuests"
import { StreakCalendar } from "./StreakCalendar"

type NodeState = "completed" | "current" | "locked" | "time-locked"

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

function buildActivityMap(days: { date: string; completedItems: unknown[] }[]): Record<string, number> {
  const map: Record<string, number> = {}
  for (const day of days) {
    if (day.completedItems.length > 0) map[day.date] = Math.min(day.completedItems.length, 4)
  }
  return map
}

function getCompletedWeekDays(days: { date: string; completedItems: unknown[] }[]): number[] {
  const now = new Date()
  const mondayOffset = (now.getDay() + 6) % 7
  const monday = new Date(now)
  monday.setDate(now.getDate() - mondayOffset)
  monday.setHours(0, 0, 0, 0)
  const result: number[] = []
  for (const day of days) {
    const d = new Date(day.date + "T12:00:00")
    if (d >= monday && day.completedItems.length > 0) result.push((d.getDay() + 6) % 7)
  }
  return result
}

// Zigzag positions: nodes snake across the screen
const ZIGZAG_POSITIONS = [
  "translate-x-8",     // left
  "translate-x-0",     // center
  "-translate-x-8",    // right
  "translate-x-0",     // center
  "translate-x-8",     // left
  "-translate-x-8",    // right
]

interface ZigzagNodeProps {
  title: string
  xp: number
  state: NodeState
  href: string
  icon: React.ReactNode
  index: number
  size?: "sm" | "md" | "lg"
  unlockLabel?: string
}

function ZigzagNode({ title, xp, state, href, icon, index, size = "md", unlockLabel }: ZigzagNodeProps) {
  const pos = ZIGZAG_POSITIONS[index % ZIGZAG_POSITIONS.length]
  const sizeClass = size === "lg" ? "h-16 w-16" : size === "sm" ? "h-11 w-11" : "h-14 w-14"

  const isClickable = state === "current" || state === "completed"

  const nodeContent = (
    <div className={`flex flex-col items-center gap-1.5 transition-transform ${pos}`}>
      <div
        className={`${sizeClass} rounded-full flex items-center justify-center transition-all relative ${
          state === "completed"
            ? "bg-amber-500 shadow-lg shadow-amber-500/30"
            : state === "current"
              ? "bg-amber-400 shadow-lg shadow-amber-400/40 animate-pulse ring-4 ring-amber-400/20"
              : "bg-gray-200 dark:bg-gray-700"
        }`}
      >
        {state === "completed" ? (
          <Check className="h-6 w-6 text-white" strokeWidth={3} />
        ) : state === "locked" || state === "time-locked" ? (
          <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        ) : (
          <span className="text-white">{icon}</span>
        )}
        {state === "completed" && (
          <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center border-2 border-white dark:border-gray-900">
            <Check className="h-3 w-3 text-white" strokeWidth={3} />
          </div>
        )}
      </div>
      <span className={`text-xs font-medium text-center max-w-[100px] ${
        state === "completed" || state === "current"
          ? "text-gray-900 dark:text-gray-100"
          : "text-gray-400 dark:text-gray-500"
      }`}>
        {title}
      </span>
      {state === "current" && (
        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
          +{xp} XP
        </span>
      )}
      {(state === "locked" || state === "time-locked") && unlockLabel && (
        <span className="text-[10px] text-gray-400 dark:text-gray-500">{unlockLabel}</span>
      )}
    </div>
  )

  if (isClickable) {
    return <Link href={href} className="block">{nodeContent}</Link>
  }
  return <div className="opacity-60">{nodeContent}</div>
}

function ChestNode({ index, unlocked }: { index: number; unlocked: boolean }) {
  const pos = ZIGZAG_POSITIONS[index % ZIGZAG_POSITIONS.length]
  return (
    <div className={`flex flex-col items-center gap-1 transition-transform ${pos}`}>
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
        unlocked ? "bg-amber-100 dark:bg-amber-900/30" : "bg-gray-100 dark:bg-gray-800"
      }`}>
        <Gift className={`h-6 w-6 ${unlocked ? "text-amber-600" : "text-gray-400"}`} />
      </div>
    </div>
  )
}

function TrophyNode({ index, unlocked }: { index: number; unlocked: boolean }) {
  const pos = ZIGZAG_POSITIONS[index % ZIGZAG_POSITIONS.length]
  return (
    <div className={`flex flex-col items-center gap-1 transition-transform ${pos}`}>
      <div className={`h-14 w-14 rounded-full flex items-center justify-center ${
        unlocked ? "bg-amber-500 shadow-lg shadow-amber-500/30" : "bg-gray-200 dark:bg-gray-700"
      }`}>
        <Trophy className={`h-6 w-6 ${unlocked ? "text-white" : "text-gray-400"}`} />
      </div>
      <span className={`text-xs font-medium ${unlocked ? "text-gray-900 dark:text-gray-100" : "text-gray-400"}`}>
        Day Complete
      </span>
    </div>
  )
}

export function PathView() {
  const { user, providerUserId } = useAuth()
  const xp = useUserStore((s) => s.xp)
  const { days, isLoading } = useTimelineData(user?.id ?? null, providerUserId)

  const completions = useMemo(() => getTodayCompletions(days), [days])
  const activityMap = useMemo(() => buildActivityMap(days), [days])
  const completedWeekDays = useMemo(() => getCompletedWeekDays(days), [days])
  const daysThisWeek = completedWeekDays.length

  const todayXP = useMemo(() => {
    let total = 0
    if (completions.morning) total += 50
    if (completions.affirmation) total += 5
    if (completions.session) total += 100
    if (completions.evening) total += 50
    return total
  }, [completions])

  const morningState: NodeState = completions.morning ? "completed" : "current"
  const affirmationState: NodeState = completions.affirmation ? "completed" : completions.morning ? "current" : "locked"
  const sessionState: NodeState = completions.session ? "completed" : (completions.morning && completions.affirmation) ? "current" : "locked"
  const eveningState: NodeState = completions.evening ? "completed" : new Date().getHours() < 18 ? "time-locked" : completions.session ? "current" : "locked"
  const allDone = completions.morning && completions.affirmation && completions.session && completions.evening

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-dvh" style={{ background: "var(--app-bg, #FAF8F3)" }}>
        <div className="h-6 w-6 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-dvh pb-24" style={{ background: "var(--app-bg, #FAF8F3)" }}>
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 pt-2 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Left: Zigzag Path */}
        <div>
          {/* Section Header Banner */}
          <div className="rounded-2xl bg-amber-500 p-4 mb-6 flex items-center gap-3">
            <ChevronLeft className="h-5 w-5 text-white/80" />
            <div>
              <p className="text-xs font-bold text-white/70 uppercase tracking-wider">Today's Path</p>
              <p className="text-sm font-semibold text-white">Daily practice</p>
            </div>
          </div>

          <StreakHeader todayXP={todayXP} dailyTarget={205} completedDays={completedWeekDays} />

          {/* Zigzag Nodes */}
          <div className="flex flex-col items-center gap-6 py-8">
            <ZigzagNode
              title="Morning Check-in"
              xp={50}
              state={morningState}
              href="/content/morning_intention?prompt=Start%20your%20day%20with%20intention.%20What%20are%20you%20focusing%20on%20today%3F&xp=50"
              icon={<Sun className="h-6 w-6" />}
              index={0}
            />

            <ZigzagNode
              title="Daily Affirmation"
              xp={5}
              state={affirmationState}
              href="/content/daily_affirmation?prompt=Write%20an%20affirmation%20that%20feels%20true%20for%20you%20today.&xp=5"
              icon={<Sparkles className="h-5 w-5" />}
              index={1}
              size="sm"
              unlockLabel="After Morning"
            />

            <ChestNode index={2} unlocked={completions.morning && completions.affirmation} />

            <ZigzagNode
              title="Transformation Session"
              xp={100}
              state={sessionState}
              href="/phone"
              icon={<Star className="h-7 w-7" />}
              index={3}
              size="lg"
              unlockLabel="When ready"
            />

            <ZigzagNode
              title="Evening Reflection"
              xp={50}
              state={eveningState}
              href="/content/evening_reflection?prompt=How%20did%20today%20go%3F%20What%20did%20you%20learn%20about%20yourself%3F&xp=50"
              icon={<Moon className="h-6 w-6" />}
              index={4}
              unlockLabel={new Date().getHours() < 18 ? "After 6 PM" : "After Session"}
            />

            <TrophyNode index={5} unlocked={allDone} />
          </div>

          {/* UP NEXT section */}
          <div className="border-t border-gray-200 dark:border-gray-800 pt-6 mt-2 text-center">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest border border-gray-200 dark:border-gray-700 px-3 py-1 rounded-full">
              Up Next
            </span>
            <p className="mt-3 text-base font-semibold text-gray-900 dark:text-gray-100">Tomorrow's Path</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">New day, new practice. Keep the streak going.</p>
          </div>
        </div>

        {/* Right: Sidebar */}
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
