"use client"

import { useLibraryData } from "@/hooks/use-library-data"
import { TrendingUp, TrendingDown, Minus, Zap } from "lucide-react"

interface TransformationCardProps {
  providerUserId: string | null
}

const SCORE_LABELS = [
  { key: "emotional_openness", label: "Emotional Openness" },
  { key: "depth_of_insight", label: "Growth Depth" },
  { key: "transformation_level", label: "Transformation" },
] as const

function ScoreBar({ label, score }: { label: string; score: number }) {
  const pct = Math.min(score * 10, 100)
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-32 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-green-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-700 w-6 text-right">{score}</span>
    </div>
  )
}

function TrendBadge({ trend }: { trend: string }) {
  const config = {
    rising: { icon: TrendingUp, label: "Rising", color: "text-green-600 bg-green-50" },
    breakthrough: { icon: Zap, label: "Breakthrough", color: "text-amber-600 bg-amber-50" },
    plateau: { icon: Minus, label: "Plateau", color: "text-gray-500 bg-gray-50" },
    declining: { icon: TrendingDown, label: "Declining", color: "text-red-500 bg-red-50" },
  }[trend] ?? { icon: Minus, label: trend, color: "text-gray-500 bg-gray-50" }

  const Icon = config.icon
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </div>
  )
}

export function TransformationCard({ providerUserId }: TransformationCardProps) {
  const { trajectoryData, growthSnapshot, isLoading } = useLibraryData(providerUserId)

  if (isLoading) return null

  // Get latest trajectory point with scores
  const latest = trajectoryData.length > 0 ? trajectoryData[trajectoryData.length - 1] : null

  if (!latest) {
    return (
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 mb-2">Your Growth</h3>
        <p className="text-sm text-gray-500 italic">
          Complete a coaching session to see your transformation scores.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-900">Your Growth</h3>
        {growthSnapshot?.trend && <TrendBadge trend={growthSnapshot.trend} />}
      </div>
      <div className="space-y-2.5">
        {SCORE_LABELS.map(({ key, label }) => {
          const score = (latest as Record<string, unknown>)[key]
          return (
            <ScoreBar
              key={key}
              label={label}
              score={typeof score === "number" ? score : 0}
            />
          )
        })}
      </div>
    </div>
  )
}
