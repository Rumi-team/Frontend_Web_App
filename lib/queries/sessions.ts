import { createServerSupabaseClient } from "@/lib/supabase"
import type {
  SessionSummary,
  UserJourneyStats,
  SessionEvaluation,
  TransformationData,
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
