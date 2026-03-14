"use client"

import { useState } from "react"
import type { UserJourneyStats } from "@/lib/types/library"

interface JourneyStatsProps {
  stats: UserJourneyStats
  displayName?: string | null
}

function TransformationScoreCircle({
  score,
  previousScore,
  onInfoClick,
}: {
  score: number
  previousScore: number | null
  onInfoClick: () => void
}) {
  const size = 142
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const delta =
    previousScore !== null && previousScore !== undefined
      ? score - previousScore
      : null

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1f2937"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#facc15"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{score}</span>
        </div>

        {/* Delta badge */}
        {delta !== null && delta !== 0 && (
          <div
            className="absolute -right-1 top-2 flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
            style={{
              background: delta > 0 ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)",
              color: delta > 0 ? "rgb(34,197,94)" : "rgb(239,68,68)",
            }}
          >
            {delta > 0 ? "+" : ""}
            {delta}
          </div>
        )}

        {/* Info button */}
        <button
          onClick={onInfoClick}
          className="absolute -right-1 bottom-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] text-gray-400 transition-colors hover:text-white"
          style={{ background: "rgba(255,255,255,0.1)" }}
        >
          i
        </button>
      </div>
      <span className="mt-2 text-xs text-gray-400">Transformation</span>
    </div>
  )
}

function StatCircle({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
        <span className="text-xl font-bold text-white">{value}</span>
      </div>
      <span className="mt-2 text-xs text-gray-400">{label}</span>
    </div>
  )
}

export function JourneyStats({ stats, displayName }: JourneyStatsProps) {
  const [showInfo, setShowInfo] = useState(false)

  return (
    <>
      <div className="flex items-end justify-center gap-8 py-4">
        <StatCircle value={stats.totalSessions} label="Sessions" />
        <TransformationScoreCircle
          score={stats.transformationScore}
          previousScore={stats.previousScore}
          onInfoClick={() => setShowInfo(true)}
        />
        <StatCircle value={stats.streakDays} label="Day Streak" />
      </div>

      {/* Transformation info dialog */}
      {showInfo && (
        <TransformationInfoDialog onClose={() => setShowInfo(false)} />
      )}
    </>
  )
}

/* ---------- TransformationInfoDialog ---------- */

function TransformationInfoDialog({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="mx-4 max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl border border-gray-800 p-6 space-y-4"
        style={{ background: "rgb(24,27,33)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-white">
          How Your Score Works
        </h2>

        <div className="space-y-3">
          <p className="text-sm text-gray-400">
            Your transformation score (0-100) combines how far you are
            in the program (55%) with the quality of your sessions (45%).
          </p>

          <div className="space-y-2">
            {[
              { label: "Transformation", weight: "35%", color: "#facc15" },
              { label: "Quality", weight: "20%", color: "#60a5fa" },
              { label: "Depth", weight: "20%", color: "#a78bfa" },
              { label: "Engagement", weight: "15%", color: "#34d399" },
              { label: "Openness", weight: "10%", color: "#f472b6" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: item.color }}
                  />
                  <span className="text-sm text-gray-300">{item.label}</span>
                </div>
                <span className="text-sm font-medium text-white">
                  {item.weight}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 border-t border-gray-800 pt-4">
          <h3 className="text-sm font-semibold text-white">
            What the numbers mean
          </h3>
          <div className="space-y-1 text-xs text-gray-400">
            <p><span className="text-gray-300">0-20:</span> Just getting started</p>
            <p><span className="text-gray-300">20-40:</span> Building foundations</p>
            <p><span className="text-gray-300">40-60:</span> Real progress &mdash; insights landing</p>
            <p><span className="text-gray-300">60-80:</span> Deep transformation underway</p>
            <p><span className="text-gray-300">80-100:</span> Program mastery</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full rounded-xl py-2.5 text-sm text-gray-400 transition-colors hover:text-white"
        >
          Close
        </button>
      </div>
    </div>
  )
}
