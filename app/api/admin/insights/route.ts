/**
 * /api/admin/insights
 *
 * Admin-only CRUD for coach_insights.
 * Auth: Supabase session required + email must be in ADMIN_EMAILS env var.
 *
 * GET  ?user_id=<provider_user_id>   — list insights for a user
 * POST { provider_user_id, insight_text, category? }  — create insight
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-auth"
import { createServerSupabaseClient } from "@/lib/supabase"

function getAdminEmails(): Set<string> {
  const raw = process.env.ADMIN_EMAILS ?? ""
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  )
}

async function requireAdmin(): Promise<{ userId: string; email: string } | NextResponse> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const email = (user.email ?? "").toLowerCase()
  if (!getAdminEmails().has(email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return { userId: user.id, email }
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const providerUserId = req.nextUrl.searchParams.get("user_id")
  if (!providerUserId) {
    return NextResponse.json({ error: "Missing user_id query param" }, { status: 400 })
  }

  const serviceClient = createServerSupabaseClient()
  const { data, error } = await serviceClient
    .from("coach_insights")
    .select("*")
    .eq("provider_user_id", providerUserId)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ insights: data ?? [] })
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  let body: { provider_user_id?: string; insight_text?: string; category?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { provider_user_id, insight_text, category } = body
  if (!provider_user_id || !insight_text?.trim()) {
    return NextResponse.json(
      { error: "Missing required fields: provider_user_id, insight_text" },
      { status: 400 }
    )
  }

  const serviceClient = createServerSupabaseClient()
  const { data, error } = await serviceClient
    .from("coach_insights")
    .insert({
      provider_user_id,
      insight_text: insight_text.trim(),
      category: category ?? "general",
      added_by: auth.email,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Also persist to Vertex AI memory if backend is configured
  const textApiUrl = process.env.TEXT_COACHING_API_URL
  if (textApiUrl) {
    fetch(`${textApiUrl.replace(/\/$/, "")}/memory/insight`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider_user_id,
        insight_text: insight_text.trim(),
        category: category ?? "general",
        added_by: auth.email,
      }),
    }).catch((err) => console.warn("[admin/insights] Failed to persist to Vertex AI memory:", err))
  }

  return NextResponse.json({ insight: data }, { status: 201 })
}
