"use client"

import { useAuth } from "@/components/auth-provider"
import { useUserStore } from "@/store/userStore"
import { getLevelInfo } from "@/lib/levels"

export function ProfileCard() {
  const { displayName } = useAuth()
  const xp = useUserStore((s) => s.xp)
  const level = getLevelInfo(xp)
  const initial = (displayName || "U").charAt(0).toUpperCase()

  const progressPercent = level.xpToNext > 0
    ? ((xp - (level.xp - level.xpToNext)) / level.xpToNext) * 100
    : 100

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar */}
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 shadow-sm">
        <span className="text-3xl font-medium text-gray-500">{initial}</span>
      </div>
      <h2 className="text-xl font-semibold text-gray-900">{displayName || "User"}</h2>

      {/* Level card */}
      <div className="w-full rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
              Lv. {level.level}
            </span>
            <span className="text-sm font-medium text-gray-800">{level.title}</span>
          </div>
          <span className="text-sm text-gray-500">🌿 {level.level}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-500"
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-green-600">
          {level.xpToNext > 0
            ? `${level.xpToNext} more to ${level.nextTitle}`
            : "Max level reached!"}
        </p>
      </div>
    </div>
  )
}
