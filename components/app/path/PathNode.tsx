"use client"

import Link from "next/link"
import { Check, Lock } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type NodeState = "completed" | "current" | "locked" | "time-locked"

interface PathNodeProps {
  title: string
  subtitle: string
  icon: LucideIcon
  emoji: string
  xp: number
  state: NodeState
  href: string
  duration: string
  unlockLabel?: string
  isMainSession?: boolean
}

export function PathNode({
  title,
  subtitle,
  icon: Icon,
  emoji,
  xp,
  state,
  href,
  duration,
  unlockLabel,
  isMainSession,
}: PathNodeProps) {
  const isLocked = state === "locked" || state === "time-locked"
  const isCompleted = state === "completed"
  const isCurrent = state === "current"

  const orbSize = isMainSession ? "h-14 w-14" : "h-12 w-12"
  const orbSizeText = isMainSession ? "text-2xl" : "text-xl"

  const content = (
    <div
      className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-colors ${
        isCurrent ? "bg-amber-50 dark:bg-amber-500/10" : ""
      } ${isLocked ? "opacity-45" : "hover:bg-gray-50 dark:hover:bg-white/5"}`}
    >
      {/* Orb */}
      <div className="relative flex-shrink-0">
        <div
          className={`${orbSize} rounded-full flex items-center justify-center ${orbSizeText} ${
            isCompleted
              ? "bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-300/30"
              : isCurrent
                ? "border-[3px] border-amber-500 bg-amber-100/50 dark:bg-amber-500/15"
                : "bg-gray-100 dark:bg-white/5 border-2 border-gray-200/60 dark:border-white/10"
          }`}
          style={isCurrent ? { animation: "pulse-glow 2s ease-in-out infinite" } : undefined}
        >
          {emoji}
        </div>
        {isCompleted && (
          <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 border-2 border-white dark:border-gray-900">
            <Check className="h-3 w-3 text-white" strokeWidth={3} />
          </div>
        )}
        {isCurrent && (
          <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 border-2 border-white dark:border-gray-900 text-[10px]">
            🦉
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className={`text-[15px] font-semibold ${isLocked ? "text-gray-400 dark:text-gray-500" : "text-gray-900 dark:text-gray-100"}`}>
          {title}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {isCompleted && (
            <span className="text-[11px] font-bold uppercase tracking-wide text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-1.5 py-0.5 rounded">
              Done
            </span>
          )}
          {isCurrent && (
            <span className="text-[11px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded">
              Up Next
            </span>
          )}
          {isLocked && (
            <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
              <Lock className="h-3 w-3" />
              {unlockLabel ?? "Locked"}
            </span>
          )}
          <span className="text-[11px] text-gray-400 dark:text-gray-500">{subtitle}</span>
        </div>
        <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{duration}</div>
      </div>

      {/* XP */}
      <span
        className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
          isLocked
            ? "text-gray-400 bg-gray-100/60 dark:text-gray-500 dark:bg-white/5"
            : "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10"
        }`}
      >
        +{xp} XP
      </span>
    </div>
  )

  if (isLocked) return content
  return <Link href={href}>{content}</Link>
}

export function PathConnector({ locked }: { locked?: boolean }) {
  return (
    <div className="ml-10 h-4">
      <div
        className={`w-0.5 h-full border-l-2 border-dashed ${
          locked ? "border-gray-200 dark:border-white/10" : "border-amber-400/40"
        }`}
      />
    </div>
  )
}
