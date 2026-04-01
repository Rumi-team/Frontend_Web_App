"use client"

import { useAuth } from "@/components/auth-provider"
import { useUserStore } from "@/store/userStore"
import { useSettingsStore } from "@/store/settingsStore"
import { ChevronRight, Flame, AlignLeft, DollarSign, Plus, Sparkles } from "lucide-react"
import Image from "next/image"

const TIERS = [
  { name: "Quiet Seed", min: 0, max: 50 },
  { name: "Tender Sprout", min: 50, max: 150 },
  { name: "Growing Sapling", min: 150, max: 400 },
  { name: "Steady Oak", min: 400, max: 800 },
  { name: "Ancient Redwood", min: 800, max: Infinity },
]

function getTier(xp: number) {
  const idx = TIERS.findIndex((t) => xp < t.max)
  const tier = TIERS[idx >= 0 ? idx : TIERS.length - 1]
  const level = idx >= 0 ? idx + 1 : TIERS.length
  const progress = tier.max === Infinity ? 1 : (xp - tier.min) / (tier.max - tier.min)
  const remaining = tier.max === Infinity ? 0 : tier.max - xp
  const nextTier = idx < TIERS.length - 1 ? TIERS[idx + 1]?.name : null
  return { tier, level, progress, remaining, nextTier }
}

export default function YouPage() {
  const { displayName } = useAuth()
  const { streak, xp, wordCount, sessionsCompleted } = useUserStore()
  const selectedVoice = useSettingsStore((s) => s.selectedVoice)

  const { tier, level, progress, remaining, nextTier } = getTier(xp)
  const savedAmount = Math.round(sessionsCompleted * 2)
  const initial = displayName?.charAt(0)?.toUpperCase() || "?"
  const avatarSrc = selectedVoice ? `/avatars/${selectedVoice.toLowerCase()}.png` : null

  return (
    <div className="min-h-dvh pb-24" style={{ background: "var(--app-bg, #FAF8F3)" }}>
      {/* Avatar + Name */}
      <div className="flex flex-col items-center pt-10 pb-4">
        <div className="relative">
          <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-4 border-gray-100 dark:border-gray-800">
            {avatarSrc ? (
              <Image src={avatarSrc} alt="Avatar" width={96} height={96} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none" }} />
            ) : (
              <span className="text-3xl font-medium text-gray-400 dark:text-gray-500">{initial}</span>
            )}
          </div>
          <button className="absolute -top-1 -right-1 h-8 w-8 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-sm">
            <Plus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <h1 className="mt-3 text-xl font-bold text-gray-900 dark:text-gray-100">{displayName || "You"}</h1>
      </div>

      {/* Level Card */}
      <div className="mx-4 rounded-2xl bg-white dark:bg-gray-900 p-4 shadow-sm dark:shadow-gray-800/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-red-500 px-2 py-0.5 text-xs font-bold text-white">Lv. {level}</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{tier.name}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Sparkles className="h-3.5 w-3.5 text-green-600" />
            <span className="font-medium">{xp}</span>
          </div>
        </div>
        <div className="mt-2 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${Math.min(progress * 100, 100)}%` }} />
        </div>
        {nextTier && (
          <button className="mt-2 flex items-center justify-between w-full">
            <span className="text-xs text-gray-500">{remaining} more to <span className="text-green-600 font-medium">{nextTier}</span></span>
            <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
          </button>
        )}
      </div>

      {/* 3-Stat Row */}
      <div className="grid grid-cols-3 gap-3 mx-4 mt-4">
        <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <Flame className="h-4 w-4 text-amber-500" />
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{streak}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Streak</p>
        </div>
        <div className="rounded-2xl bg-gray-100 dark:bg-gray-800 p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <AlignLeft className="h-4 w-4 text-gray-500" />
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{wordCount}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Words</p>
        </div>
        <div className="rounded-2xl bg-green-50 dark:bg-green-950/30 p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">${savedAmount}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Saved</p>
        </div>
      </div>

      {/* About You */}
      <div className="mx-4 mt-4 rounded-2xl bg-white dark:bg-gray-900 p-4 shadow-sm dark:shadow-gray-800/20">
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">About You</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          You're direct and independent, the kind of person who sizes something up before deciding it's worth your time. You're here to get more traction in your days and find a rhythm that actually holds.
        </p>
        <p className="mt-3 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          This is regularly updated by Rumi
        </p>
      </div>

      {/* Your Focus Areas */}
      <div className="mx-4 mt-4 rounded-2xl bg-white dark:bg-gray-900 p-4 shadow-sm dark:shadow-gray-800/20">
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-3">Your Focus Areas</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-400 shrink-0" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Clarify what I want help with</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="mt-1.5 h-2 w-2 rounded-full bg-green-400 shrink-0" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Build consistent daily habits</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="mt-1.5 h-2 w-2 rounded-full bg-purple-400 shrink-0" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Manage stress and anxiety</span>
          </li>
        </ul>
        <p className="mt-3 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          This is regularly updated by Rumi
        </p>
      </div>
    </div>
  )
}
