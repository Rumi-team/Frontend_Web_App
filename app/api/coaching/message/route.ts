/**
 * POST /api/coaching/message
 *
 * Proxies text coaching messages to the backend FastAPI text API.
 * Requires TEXT_COACHING_API_URL env var pointing to the deployed backend.
 *
 * Request:  { message: string; session_id?: string }
 * Response: { response: string; session_id: string }
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-auth"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  // 1. Auth check
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // 2. Verify access code
  const serviceClient = createServerSupabaseClient()
  const { data: redemption } = await serviceClient
    .from("access_code_redemptions")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!redemption) {
    return NextResponse.json({ error: "Access code required" }, { status: 403 })
  }

  // 3. Resolve provider_user_id
  const { data: identity } = await serviceClient
    .from("user_identities")
    .select("provider_user_id")
    .eq("user_id", user.id)
    .single()

  const providerUserId = identity?.provider_user_id ?? user.identities?.[0]?.id ?? user.id

  // 4. Parse request body
  let body: { message?: string; session_id?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (!body.message?.trim()) {
    return NextResponse.json({ error: "Missing message" }, { status: 400 })
  }

  // 5. Forward to text coaching API
  const textApiUrl = process.env.TEXT_COACHING_API_URL
  if (!textApiUrl) {
    return NextResponse.json(
      {
        error: "Text coaching not yet deployed",
        hint: "Set TEXT_COACHING_API_URL to your deployed backend URL",
      },
      { status: 503 }
    )
  }

  try {
    const backendRes = await fetch(`${textApiUrl.replace(/\/$/, "")}/session/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: providerUserId,
        message: body.message.trim(),
        session_id: body.session_id ?? null,
      }),
      signal: AbortSignal.timeout(30_000),
    })

    if (!backendRes.ok) {
      const errText = await backendRes.text().catch(() => "")
      console.error("[coaching/message] Backend error:", backendRes.status, errText)
      return NextResponse.json(
        { error: "Coaching service error", details: errText },
        { status: 502 }
      )
    }

    const data = await backendRes.json()
    return NextResponse.json({
      response: data.response ?? data.message ?? "",
      session_id: data.session_id ?? body.session_id ?? null,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[coaching/message] Proxy error:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
