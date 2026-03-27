"use client"

import { useState } from "react"
import Image from "next/image"
import { useLibraryData } from "@/hooks/use-library-data"
import { JourneyStats } from "./journey-stats"
import { SessionDetailSheet } from "./session-detail-sheet"
import { GrowthTrajectoryChart } from "./growth-trajectory-chart"
import { GrowthAlertBanner } from "./growth-alert-banner"
import { StrategyEffectivenessChart } from "./strategy-effectiveness-chart"
import type { SessionSummary } from "@/lib/types/library"
import { X, Sparkles, Clock, Loader2 } from "lucide-react"

interface LibrarySheetProps {
  isOpen: boolean
  onClose: () => void
  providerUserId: string | null
  displayName?: string | null
}

export function LibrarySheet({
  isOpen,
  onClose,
  providerUserId,
  displayName,
}: LibrarySheetProps) {
  const { sessions, stats, isLoading, fetchEvaluation, trajectoryData, growthSnapshot } =
    useLibraryData(providerUserId)
  const [selectedSession, setSelectedSession] = useState<SessionSummary | null>(
    null
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Your Journey" onKeyDown={(e) => { if (e.key === "Escape") onClose() }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />

      {/* Sheet panel */}
      <div
        className="relative z-10 flex h-full w-full max-w-lg flex-col overflow-hidden border-l border-gray-800 sm:max-w-md"
        style={{ background: "rgb(15, 18, 23)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
          {selectedSession ? (
            <button
              onClick={() => setSelectedSession(null)}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              &larr; Back
            </button>
          ) : (
            <h2 className="text-2xl font-bold text-white">
              {displayName ? `${displayName}'s Journey` : "Your Journey"}
            </h2>
          )}
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {selectedSession ? (
            <SessionDetailSheet
              session={selectedSession}
              fetchEvaluation={fetchEvaluation}
            />
          ) : isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
            </div>
          ) : (
            <div className="space-y-6 px-5 py-4">
              {/* Stats */}
              <JourneyStats stats={stats} displayName={displayName} />

              {/* Growth Trajectory Chart (Layer 3) */}
              <GrowthTrajectoryChart data={trajectoryData} snapshot={growthSnapshot} />

              {/* Growth Alert Banner (Layer 3) */}
              {growthSnapshot && <GrowthAlertBanner snapshot={growthSnapshot} />}

              {/* Strategy Effectiveness (Layer 2) */}
              <StrategyEffectivenessChart data={trajectoryData} />

              {/* Session list */}
              {sessions.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <Sparkles className="h-10 w-10 text-gray-600" />
                  <p className="text-gray-500">Complete your first session</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <SessionListCard
                      key={session.session_id}
                      session={session}
                      onClick={() => setSelectedSession(session)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ---------- Session list card ---------- */

function SessionListCard({
  session,
  onClick,
}: {
  session: SessionSummary
  onClick: () => void
}) {
  const date = new Date(session.session_started_at)
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl border border-gray-800 text-left transition-colors hover:border-gray-700 overflow-hidden"
      style={{ background: "rgba(255,255,255,0.02)" }}
    >
      {session.image_url && (
        <div className="relative h-28 w-full overflow-hidden">
          <Image
            src={session.image_url}
            alt={session.topic}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}
      <div className="p-3 space-y-1.5">
        <p className="text-xs italic text-gray-500">{formattedDate}</p>
        <p className="text-sm font-medium text-white line-clamp-2">
          {session.topic}
        </p>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {session.duration_minutes}m
          </span>
          <span>{session.message_count} messages</span>
        </div>
      </div>
    </button>
  )
}
