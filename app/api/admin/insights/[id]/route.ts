/**
 * /api/admin/insights/[id]
 *
 * PATCH { is_active?, insight_text?, category? }  — update an insight
 * DELETE                                          — hard-delete an insight
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const { id } = await params

  let body: { is_active?: boolean; insight_text?: string; category?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.is_active !== undefined) update.is_active = body.is_active
  if (body.insight_text !== undefined) update.insight_text = body.insight_text.trim()
  if (body.category !== undefined) update.category = body.category

  const serviceClient = createServerSupabaseClient()
  const { data, error } = await serviceClient
    .from("coach_insights")
    .update(update)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ insight: data })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  const { id } = await params

  const serviceClient = createServerSupabaseClient()
  const { error } = await serviceClient
    .from("coach_insights")
    .delete()
    .eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
