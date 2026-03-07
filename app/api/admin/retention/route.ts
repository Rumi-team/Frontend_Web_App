import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-auth";
import { fetchMetrics } from "@/lib/retention/client";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "ali@rumi.team").split(",");

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const metrics = await fetchMetrics();

  // Get recent decisions with action_payload
  const { data: recentDecisions } = await supabase
    .schema("retention")
    .from("decisions")
    .select(
      "id,provider_user_id,action_chosen,action_payload,was_exploration,policy_version,created_at"
    )
    .order("created_at", { ascending: false })
    .limit(50);

  return NextResponse.json({
    metrics: metrics || {},
    recent_decisions: recentDecisions || [],
  });
}
