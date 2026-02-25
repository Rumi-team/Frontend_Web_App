import { createServerSupabaseClient } from "@/lib/supabase"
import type {
  SessionSummary,
  UserJourneyStats,
  SessionEvaluation,
  TransformationData,
  TrajectoryDataPoint,
  GrowthSnapshot,
} from "@/lib/types/library"

export async function fetchSessionHistory(
  providerUserId: string
): Promise<SessionSummary[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("session_summaries")
    .select(
      "session_id, topic, image_url, session_started_at, duration_minutes, message_count, summary, key_moment, suggestions, resilience_delta, depth_score, phase_quality, engagement_level, assignments_text, platform"
    )
    .eq("provider_user_id", providerUserId)
    .order("session_started_at", { ascending: false })

  if (error) {
    console.error("Failed to fetch session history:", error)
    return []
  }

  return (data ?? []).map((row: any) => ({
    ...row,
    duration_minutes: row.duration_minutes ?? 0,
    message_count: row.message_count ?? 0,
    resilience_delta: row.resilience_delta ?? 0,
    depth_score: row.depth_score ?? 5,
  }))
}

export async function fetchSessionById(
  sessionId: string
): Promise<SessionSummary | null> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("session_summaries")
    .select("*")
    .eq("session_id", sessionId)
    .single()

  if (error || !data) return null

  return {
    ...data,
    duration_minutes: data.duration_minutes ?? 0,
    message_count: data.message_count ?? 0,
    resilience_delta: data.resilience_delta ?? 0,
    depth_score: data.depth_score ?? 5,
  }
}

export async function fetchUserJourneyStats(
  providerUserId: string
): Promise<UserJourneyStats> {
  const supabase = createServerSupabaseClient()

  // Total sessions
  const { count } = await supabase
    .from("session_summaries")
    .select("*", { count: "exact", head: true })
    .eq("provider_user_id", providerUserId)

  // Transformation data from user_state
  const { data: stateRow } = await supabase
    .from("user_state")
    .select("state")
    .eq("provider_user_id", providerUserId)
    .single()

  const transformation: TransformationData | null =
    stateRow?.state?.transformation ?? null
  const overallScore = transformation?.overall_score
    ? Math.round(transformation.overall_score)
    : 0

  // Streak: count consecutive days with sessions (recent first)
  const { data: sessions } = await supabase
    .from("session_summaries")
    .select("session_started_at")
    .eq("provider_user_id", providerUserId)
    .order("session_started_at", { ascending: false })
    .limit(30)

  let streakDays = 0
  if (sessions && sessions.length > 0) {
    const dates = new Set(
      sessions.map((s: any) =>
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
        // Allow skipping today if no session yet
        break
      }
    }
  }

  return {
    totalSessions: count ?? 0,
    transformationScore: overallScore,
    previousScore: null,
    streakDays,
    lastVisitDate: sessions?.[0]?.session_started_at ?? null,
  }
}

export async function fetchSessionEvaluation(
  sessionId: string
): Promise<SessionEvaluation | null> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("session_evaluations")
    .select("*")
    .eq("session_id", sessionId)
    .single()

  if (error || !data) return null
  return data as SessionEvaluation
}

export async function fetchTrajectoryData(
  providerUserId: string
): Promise<TrajectoryDataPoint[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("session_evaluations")
    .select(
      "evaluated_at, transformation_level, engagement_level, resistance_level, depth_of_insight, phase_completion_quality, emotional_openness, strategy_used"
    )
    .eq("provider_user_id", providerUserId)
    .order("evaluated_at", { ascending: true })

  if (error || !data) return []

  return data.map((row: any) => {
    const t = row.transformation_level ?? 3
    const q = row.phase_completion_quality ?? 5
    const d = row.depth_of_insight ?? 5
    const e = row.engagement_level ?? 5
    const r = row.resistance_level ?? 5
    const overall = Math.round(
      t * 3.5 + q * 2.0 + d * 2.0 + e * 1.5 + (10 - r) * 1.0
    ) / 10

    return {
      date: row.evaluated_at?.split("T")[0] ?? "",
      transformation: t,
      engagement: e,
      resistance: r,
      depth: d,
      overall: Math.round(overall * 10) / 10,
      strategy: row.strategy_used ?? null,
    }
  })
}

export async function fetchGrowthSnapshot(
  providerUserId: string
): Promise<GrowthSnapshot | null> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("growth_snapshots")
    .select("*")
    .eq("provider_user_id", providerUserId)
    .order("snapshot_date", { ascending: false })
    .limit(1)
    .single()

  if (error || !data) return null
  return data as GrowthSnapshot
}
