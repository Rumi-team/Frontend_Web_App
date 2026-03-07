/**
 * GET /api/user/memory
 *
 * Returns memory-related data for the authenticated user:
 *   - Recent session summaries (from Supabase)
 *   - Session evaluations with transformation scores
 *   - Active coach insights (admin-authored observations)
 *
 * This serves as the memory panel data source for the /chat page.
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-auth"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const serviceClient = createServerSupabaseClient()

  // Resolve provider_user_id
  const { data: identity } = await serviceClient
    .from("user_identities")
    .select("provider_user_id")
    .eq("user_id", user.id)
    .single()

  const providerUserId = identity?.provider_user_id ?? user.identities?.[0]?.id ?? user.id

  const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "10", 10)

  // Fetch recent session summaries
  const { data: sessions } = await serviceClient
    .from("session_summaries")
    .select(
      "session_id, topic, session_started_at, summary, key_moment, assignments_text, transformation_level"
    )
    .eq("provider_user_id", providerUserId)
    .order("session_started_at", { ascending: false })
    .limit(limit)

  // Fetch latest evaluation
  const { data: evaluations } = await serviceClient
    .from("session_evaluations")
    .select(
      "evaluated_at, transformation_level, depth_of_insight, engagement_level, transformation_moment, evaluation_summary, strengths, growth_areas, recommended_assignments"
    )
    .eq("provider_user_id", providerUserId)
    .order("evaluated_at", { ascending: false })
    .limit(5)

  // Fetch active coach insights
  const { data: insights } = await serviceClient
    .from("coach_insights")
    .select("id, insight_text, category, created_at, last_injected_at")
    .eq("provider_user_id", providerUserId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  // Fetch growth snapshot
  const { data: growthSnapshot } = await serviceClient
    .from("growth_snapshots")
    .select("snapshot_date, avg_transformation, trend, alert_type, alert_message")
    .eq("provider_user_id", providerUserId)
    .order("snapshot_date", { ascending: false })
    .limit(1)
    .maybeSingle()

  return NextResponse.json({
    provider_user_id: providerUserId,
    sessions: sessions ?? [],
    evaluations: evaluations ?? [],
    insights: insights ?? [],
    growth_snapshot: growthSnapshot ?? null,
  })
}
