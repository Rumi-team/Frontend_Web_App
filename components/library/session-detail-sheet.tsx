"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import type { SessionSummary, SessionEvaluation } from "@/lib/types/library"
import {
  Clock,
  TrendingUp,
  Activity,
  Star,
  Zap,
  BookOpen,
  Lightbulb,
  ClipboardList,
  CheckCircle,
  Loader2,
} from "lucide-react"

interface SessionDetailSheetProps {
  session: SessionSummary
  fetchEvaluation: (sessionId: string) => Promise<SessionEvaluation | null>
}

export function SessionDetailSheet({
  session,
  fetchEvaluation,
}: SessionDetailSheetProps) {
  const [evaluation, setEvaluation] = useState<SessionEvaluation | null>(null)
  const [evalLoading, setEvalLoading] = useState(true)

  useEffect(() => {
    setEvalLoading(true)
    fetchEvaluation(session.session_id).then((ev) => {
      setEvaluation(ev)
      setEvalLoading(false)
    })
  }, [session.session_id, fetchEvaluation])

  const date = new Date(session.session_started_at)
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return (
    <div className="space-y-5 px-5 py-4">
      {/* Hero image */}
      {session.image_url ? (
        <div className="relative h-56 w-full overflow-hidden rounded-xl">
          <Image
            src={session.image_url}
            alt={session.topic}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      ) : (
        <div
          className="flex h-32 items-center justify-center rounded-xl"
          style={{
            background: "linear-gradient(135deg, rgba(250,204,21,0.15), rgba(250,204,21,0.05))",
          }}
        >
          <BookOpen className="h-10 w-10 text-yellow-400/40" />
        </div>
      )}

      {/* Title + date */}
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-white">{session.topic}</h2>
        <p className="text-xs text-gray-500">{formattedDate}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2">
        <StatPill icon={Clock} label="Duration" value={`${session.duration_minutes}m`} />
        <StatPill icon={TrendingUp} label="Resilience" value={`${session.resilience_delta > 0 ? "+" : ""}${session.resilience_delta}`} />
        <StatPill icon={Activity} label="Depth" value={`${session.depth_score}/10`} />
        {session.phase_quality !== null && (
          <StatPill icon={Star} label="Quality" value={`${session.phase_quality}/10`} />
        )}
      </div>

      {/* Evaluation metrics */}
      {evalLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
        </div>
      ) : evaluation ? (
        <div className="grid grid-cols-3 gap-2">
          <EvalCard label="Transformation" value={evaluation.transformation_level} accent />
          <EvalCard label="Engagement" value={evaluation.engagement_level} />
          <EvalCard label="Openness" value={evaluation.emotional_openness} />
        </div>
      ) : null}

      {/* Coaching strategy badge (Layer 2) */}
      {evaluation?.strategy_used && (
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
            style={{
              background: "rgba(250,204,21,0.1)",
              color: "#facc15",
              border: "1px solid rgba(250,204,21,0.2)",
            }}
          >
            {evaluation.strategy_used.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </span>
          {evaluation.pacing_recommendation && (
            <span
              className="inline-flex items-center rounded-full px-2.5 py-1 text-xs"
              style={{
                background:
                  evaluation.pacing_recommendation === "speed_up"
                    ? "rgba(34,197,94,0.1)"
                    : evaluation.pacing_recommendation === "slow_down"
                    ? "rgba(239,68,68,0.1)"
                    : "rgba(156,163,175,0.1)",
                color:
                  evaluation.pacing_recommendation === "speed_up"
                    ? "rgb(34,197,94)"
                    : evaluation.pacing_recommendation === "slow_down"
                    ? "rgb(239,68,68)"
                    : "rgb(156,163,175)",
              }}
            >
              {evaluation.pacing_recommendation === "speed_up"
                ? "Speed Up"
                : evaluation.pacing_recommendation === "slow_down"
                ? "Slow Down"
                : "Maintain"}
            </span>
          )}
        </div>
      )}

      {/* Transformation moment */}
      {evaluation?.transformation_moment && (
        <div
          className="rounded-xl border p-4 flex items-start gap-3"
          style={{
            borderColor: "rgba(250,204,21,0.2)",
            background: "rgba(250,204,21,0.04)",
          }}
        >
          <Zap className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "#facc15" }} />
          <div>
            <h3 className="text-sm font-semibold mb-1" style={{ color: "#facc15" }}>
              Transformation Moment
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              {evaluation.transformation_moment}
            </p>
          </div>
        </div>
      )}

      {/* Content sections */}
      {session.summary && (
        <DetailSection icon={BookOpen} title="Summary">
          {session.summary}
        </DetailSection>
      )}

      {session.key_moment && (
        <DetailSection icon={Lightbulb} title="Key Moment">
          {session.key_moment}
        </DetailSection>
      )}

      {session.suggestions && (
        <DetailSection icon={ClipboardList} title="Suggestions">
          {session.suggestions}
        </DetailSection>
      )}

      {session.assignments_text && (
        <DetailSection icon={CheckCircle} title="Assignments">
          {session.assignments_text}
        </DetailSection>
      )}

      {/* Bottom padding for scroll */}
      <div className="h-4" />
    </div>
  )
}

/* Helpers */

function StatPill({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div
      className="flex items-center gap-1.5 rounded-lg px-2.5 py-2"
      style={{ background: "rgba(255,255,255,0.04)" }}
    >
      <Icon className="h-3.5 w-3.5 text-gray-500" />
      <div>
        <p className="text-xs font-medium text-white">{value}</p>
        <p className="text-[9px] text-gray-500">{label}</p>
      </div>
    </div>
  )
}

function EvalCard({
  label,
  value,
  accent,
}: {
  label: string
  value: number
  accent?: boolean
}) {
  return (
    <div
      className="rounded-lg p-3 text-center"
      style={{ background: "rgba(255,255,255,0.04)" }}
    >
      <p
        className={`text-xl font-bold ${accent ? "text-yellow-400" : "text-white"}`}
      >
        {value}/10
      </p>
      <p className="text-[10px] text-gray-500">{label}</p>
    </div>
  )
}

function DetailSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-yellow-400" />
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <p className="text-sm text-gray-300 leading-relaxed">{children}</p>
    </div>
  )
}
