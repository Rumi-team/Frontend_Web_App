"use client"

import { useState, useEffect, useCallback } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase-auth-browser"
import type {
  SessionSummary,
  UserJourneyStats,
  SessionEvaluation,
  TransformationData,
  CommitmentData,
  TrajectoryDataPoint,
  GrowthSnapshot,
} from "@/lib/types/library"

interface UseLibraryDataReturn {
  sessions: SessionSummary[]
  stats: UserJourneyStats
  commitments: CommitmentData[]
  transformation: TransformationData | null
  trajectoryData: TrajectoryDataPoint[]
  growthSnapshot: GrowthSnapshot | null
  isLoading: boolean
  refetch: () => void
  fetchEvaluation: (sessionId: string) => Promise<SessionEvaluation | null>
}

export function useLibraryData(
  providerUserId: string | null
): UseLibraryDataReturn {
  const [sessions, setSessions] = useState<SessionSummary[]>([])
  const [stats, setStats] = useState<UserJourneyStats>({
    totalSessions: 0,
    transformationScore: 0,
    previousScore: null,
    streakDays: 0,
    lastVisitDate: null,
  })
  const [commitments, setCommitments] = useState<CommitmentData[]>([])
  const [transformation, setTransformation] =
    useState<TransformationData | null>(null)
  const [trajectoryData, setTrajectoryData] = useState<TrajectoryDataPoint[]>([])
  const [growthSnapshot, setGrowthSnapshot] = useState<GrowthSnapshot | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    if (!providerUserId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const supabase = createSupabaseBrowserClient()

      // Fetch sessions + user_state + evaluations + growth snapshot in parallel
      const [sessionsRes, stateRes, evalRes, snapshotRes] = await Promise.all([
        supabase
          .from("session_summaries")
          .select(
            "session_id, topic, image_url, session_started_at, duration_minutes, message_count, summary, key_moment, suggestions, resilience_delta, depth_score, phase_quality, engagement_level, assignments_text, platform"
          )
          .eq("provider_user_id", providerUserId)
          .order("session_started_at", { ascending: false }),
        supabase
          .from("user_state")
          .select("state")
          .eq("provider_user_id", providerUserId)
          .single(),
        supabase
          .from("session_evaluations")
          .select(
            "evaluated_at, transformation_level, engagement_level, resistance_level, depth_of_insight, strategy_used, phase_completion_quality, emotional_openness"
          )
          .eq("provider_user_id", providerUserId)
          .order("evaluated_at", { ascending: true }),
        supabase
          .from("growth_snapshots")
          .select("*")
          .eq("provider_user_id", providerUserId)
          .order("snapshot_date", { ascending: false })
          .limit(1),
      ])

      // Process sessions
      const rawSessions = (sessionsRes.data ?? []).map((row: any) => ({
        ...row,
        duration_minutes: row.duration_minutes ?? 0,
        message_count: row.message_count ?? 0,
        resilience_delta: row.resilience_delta ?? 0,
        depth_score: row.depth_score ?? 5,
      }))
      setSessions(rawSessions)

      // Process user_state — handle double-encoded JSON string from backend
      let state = stateRes.data?.state
      if (typeof state === "string") {
        try { state = JSON.parse(state) } catch { state = null }
      }
      const txData: TransformationData | null = state?.transformation ?? null
      setTransformation(txData)

      const rawCommitments: CommitmentData[] = (state?.commitments ?? []).map(
        (c: any) => ({
          what: c.what ?? "",
          when: c.when ?? null,
          status: c.status ?? "active",
          created_at: c.created_at ?? null,
        })
      )
      setCommitments(rawCommitments)

      // Compute stats
      const overallScore = txData?.overall_score
        ? Math.round(txData.overall_score)
        : 0

      // Streak computation
      let streakDays = 0
      if (rawSessions.length > 0) {
        const dates = new Set(
          rawSessions
            .slice(0, 30)
            .map((s: SessionSummary) =>
              new Date(s.session_started_at).toISOString().slice(0, 10)
            )
        )
        const today = new Date()
        for (let i = 0; i < 30; i++) {
          const d = new Date(today)
          d.setDate(d.getDate() - i)
          const dateStr = d.toISOString().slice(0, 10)
          if (dates.has(dateStr)) {
            streakDays++
          } else if (i > 0) {
            break
          }
        }
      }

      setStats({
        totalSessions: rawSessions.length,
        transformationScore: overallScore,
        previousScore: null,
        streakDays,
        lastVisitDate: rawSessions[0]?.session_started_at ?? null,
      })

      // Process trajectory data from evaluations
      const trajectoryPoints: TrajectoryDataPoint[] = (evalRes.data ?? []).map((e: any) => ({
        date: e.evaluated_at,
        transformation: e.transformation_level ?? 0,
        engagement: e.engagement_level ?? 0,
        resistance: e.resistance_level ?? 0,
        depth: e.depth_of_insight ?? 0,
        overall: Math.round(
          (e.transformation_level ?? 0) * 3.5 +
          (e.phase_completion_quality ?? 0) * 2.0 +
          (e.depth_of_insight ?? 0) * 2.0 +
          (e.engagement_level ?? 0) * 1.5 +
          (10 - (e.resistance_level ?? 5)) * 1.0
        ) / 10,
        strategy: e.strategy_used ?? null,
      }))
      setTrajectoryData(trajectoryPoints)

      // Process growth snapshot
      const latestSnapshot = snapshotRes.data?.[0] ?? null
      setGrowthSnapshot(latestSnapshot as GrowthSnapshot | null)
    } catch (err) {
      console.error("Failed to load library data:", err)
    }
    setIsLoading(false)
  }, [providerUserId])

  useEffect(() => {
    load()
  }, [load])

  const fetchEvaluation = useCallback(
    async (sessionId: string): Promise<SessionEvaluation | null> => {
      try {
        const supabase = createSupabaseBrowserClient()
        const { data, error } = await supabase
          .from("session_evaluations")
          .select("*")
          .eq("session_id", sessionId)
          .single()
        if (error || !data) return null
        return data as SessionEvaluation
      } catch {
        return null
      }
    },
    []
  )

  return {
    sessions,
    stats,
    commitments,
    transformation,
    trajectoryData,
    growthSnapshot,
    isLoading,
    refetch: load,
    fetchEvaluation,
  }
}
