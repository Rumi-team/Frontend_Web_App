"use client"

import { useEffect, useState } from "react"
import { Brain, TrendingUp, AlertTriangle, BookOpen, Lightbulb, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface MemoryPanelProps {
  className?: string
}

interface Session {
  session_id: string
  topic: string
  session_started_at: string
  summary: string | null
  key_moment: string | null
  assignments_text: string | null
}

interface Evaluation {
  evaluated_at: string
  transformation_level: number
  depth_of_insight: number
  engagement_level: number
  transformation_moment: string | null
  evaluation_summary: string | null
}

interface Insight {
  id: string
  insight_text: string
  category: string
  created_at: string
  last_injected_at: string | null
}

interface GrowthSnapshot {
  snapshot_date: string
  avg_transformation: number
  trend: string
  alert_type: string | null
  alert_message: string | null
}

interface MemoryData {
  sessions: Session[]
  evaluations: Evaluation[]
  insights: Insight[]
  growth_snapshot: GrowthSnapshot | null
}

const TREND_COLOR: Record<string, string> = {
  rising: "text-green-400",
  breakthrough: "text-yellow-400",
  plateau: "text-orange-400",
  declining: "text-red-400",
}

export function MemoryPanel({ className }: MemoryPanelProps) {
  const [data, setData] = useState<MemoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedSection, setExpandedSection] = useState<string | null>("insights")

  useEffect(() => {
    fetch("/api/user/memory")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  function toggleSection(section: string) {
    setExpandedSection((prev) => (prev === section ? null : section))
  }

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center h-40", className)}>
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent" />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className={cn("space-y-3 text-sm", className)}>
      {/* Growth Trend */}
      {data.growth_snapshot && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-yellow-400 flex-shrink-0" />
            <span className="font-semibold text-white text-xs uppercase tracking-wider">Growth Trend</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn("font-bold capitalize text-base", TREND_COLOR[data.growth_snapshot.trend] ?? "text-gray-400")}>
              {data.growth_snapshot.trend}
            </span>
            <span className="text-gray-500 text-xs">
              avg transformation {data.growth_snapshot.avg_transformation?.toFixed(1)}/10
            </span>
          </div>
          {data.growth_snapshot.alert_message && (
            <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 p-2">
              <AlertTriangle className="h-3.5 w-3.5 text-orange-400 flex-shrink-0 mt-0.5" />
              <p className="text-orange-300 text-xs">{data.growth_snapshot.alert_message}</p>
            </div>
          )}
        </div>
      )}

      {/* Coach Insights */}
      <SectionHeader
        icon={<Lightbulb className="h-4 w-4 text-yellow-400" />}
        title="Coach Insights"
        count={data.insights.length}
        expanded={expandedSection === "insights"}
        onToggle={() => toggleSection("insights")}
      />
      {expandedSection === "insights" && (
        <div className="space-y-2 pl-1">
          {data.insights.length === 0 ? (
            <p className="text-gray-600 text-xs italic">No coach insights yet.</p>
          ) : (
            data.insights.map((ins) => (
              <div key={ins.id} className="rounded-lg border border-yellow-500/15 bg-yellow-500/5 p-2.5">
                <p className="text-gray-200 text-xs leading-relaxed">{ins.insight_text}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-yellow-500/70 capitalize">{ins.category}</span>
                  {ins.last_injected_at && (
                    <span className="text-xs text-gray-600">
                      · used {new Date(ins.last_injected_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Recent Sessions */}
      <SectionHeader
        icon={<BookOpen className="h-4 w-4 text-blue-400" />}
        title="Recent Sessions"
        count={data.sessions.length}
        expanded={expandedSection === "sessions"}
        onToggle={() => toggleSection("sessions")}
      />
      {expandedSection === "sessions" && (
        <div className="space-y-2 pl-1">
          {data.sessions.length === 0 ? (
            <p className="text-gray-600 text-xs italic">No sessions yet.</p>
          ) : (
            data.sessions.slice(0, 5).map((s) => (
              <div key={s.session_id} className="rounded-lg border border-white/8 bg-white/[0.02] p-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-xs font-medium truncate max-w-[140px]">{s.topic || "Session"}</span>
                  <span className="text-gray-600 text-xs flex-shrink-0">
                    {new Date(s.session_started_at).toLocaleDateString()}
                  </span>
                </div>
                {s.key_moment && (
                  <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{s.key_moment}</p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Latest Evaluation */}
      {data.evaluations.length > 0 && (
        <>
          <SectionHeader
            icon={<Brain className="h-4 w-4 text-purple-400" />}
            title="Latest Evaluation"
            count={null}
            expanded={expandedSection === "eval"}
            onToggle={() => toggleSection("eval")}
          />
          {expandedSection === "eval" && (
            <div className="pl-1">
              <div className="rounded-lg border border-purple-500/15 bg-purple-500/5 p-2.5 space-y-2">
                {data.evaluations[0].evaluation_summary && (
                  <p className="text-gray-300 text-xs leading-relaxed">{data.evaluations[0].evaluation_summary}</p>
                )}
                <div className="grid grid-cols-3 gap-2">
                  <Metric label="Transform" value={data.evaluations[0].transformation_level} />
                  <Metric label="Depth" value={data.evaluations[0].depth_of_insight} />
                  <Metric label="Engage" value={data.evaluations[0].engagement_level} />
                </div>
                {data.evaluations[0].transformation_moment && (
                  <p className="text-yellow-400/80 text-xs italic">
                    "{data.evaluations[0].transformation_moment}"
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function SectionHeader({
  icon,
  title,
  count,
  expanded,
  onToggle,
}: {
  icon: React.ReactNode
  title: string
  count: number | null
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-lg p-2 hover:bg-white/[0.03] transition-colors"
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-semibold text-white text-xs uppercase tracking-wider">{title}</span>
        {count !== null && count > 0 && (
          <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-xs text-gray-400">{count}</span>
        )}
      </div>
      {expanded ? (
        <ChevronUp className="h-3.5 w-3.5 text-gray-500" />
      ) : (
        <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
      )}
    </button>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  const color = value >= 7 ? "text-green-400" : value >= 5 ? "text-yellow-400" : "text-red-400"
  return (
    <div className="text-center">
      <div className={cn("text-lg font-bold", color)}>{value}</div>
      <div className="text-gray-600 text-xs">{label}</div>
    </div>
  )
}
