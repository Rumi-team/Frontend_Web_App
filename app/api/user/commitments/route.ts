/**
 * GET  /api/user/commitments — Returns active commitments from user_state
 * PATCH /api/user/commitments — Updates a commitment's status
 */

import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-auth"
import { createServerSupabaseClient } from "@/lib/supabase"

// ---------------------------------------------------------------------------
// GET — Fetch active commitments
// ---------------------------------------------------------------------------

export async function GET() {
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

  const providerUserId =
    identity?.provider_user_id ?? user.identities?.[0]?.id ?? user.id

  // Fetch user_state
  const { data: row, error: fetchError } = await serviceClient
    .from("user_state")
    .select("state")
    .eq("provider_user_id", providerUserId)
    .limit(1)
    .single()

  if (fetchError || !row) {
    return NextResponse.json({ commitments: [] })
  }

  const state = row.state as Record<string, unknown>
  const allCommitments = (state?.commitments ?? []) as Array<{
    what: string
    when?: string
    status?: string
    created_at?: string
  }>

  // Return all commitments (let client filter if needed) but default to active+completed
  const commitments = allCommitments
    .filter((c) => c.status === "active" || c.status === "completed" || !c.status)
    .map((c) => ({
      what: c.what,
      when: c.when ?? null,
      status: c.status ?? "active",
      created_at: c.created_at ?? null,
    }))

  return NextResponse.json({ commitments })
}

// ---------------------------------------------------------------------------
// PATCH — Update a commitment's status
// ---------------------------------------------------------------------------

export async function PATCH(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { what, status } = body as { what?: string; status?: string }

  if (!what || !status) {
    return NextResponse.json(
      { error: "Missing required fields: what, status" },
      { status: 400 }
    )
  }

  const validStatuses = ["completed", "active", "dropped"]
  if (!validStatuses.includes(status)) {
    return NextResponse.json(
      { error: `Invalid status '${status}'. Must be one of: ${validStatuses.join(", ")}` },
      { status: 400 }
    )
  }

  const serviceClient = createServerSupabaseClient()

  // Resolve provider_user_id
  const { data: identity } = await serviceClient
    .from("user_identities")
    .select("provider_user_id")
    .eq("user_id", user.id)
    .single()

  const providerUserId =
    identity?.provider_user_id ?? user.identities?.[0]?.id ?? user.id

  // Fetch current user_state
  const { data: row, error: fetchError } = await serviceClient
    .from("user_state")
    .select("state, version")
    .eq("provider_user_id", providerUserId)
    .limit(1)
    .single()

  if (fetchError || !row) {
    return NextResponse.json(
      { error: "User state not found" },
      { status: 404 }
    )
  }

  const state = row.state as Record<string, unknown>
  const version = (row.version as number) ?? 1
  const commitments = (state?.commitments ?? []) as Array<{
    what: string
    when?: string
    status?: string
    created_at?: string
    confidence?: number
    blockers?: string[]
  }>

  // Find the matching commitment
  const idx = commitments.findIndex((c) => c.what === what)
  if (idx === -1) {
    return NextResponse.json(
      { error: `No commitment found with text: ${what}` },
      { status: 404 }
    )
  }

  const previousStatus = commitments[idx].status ?? "active"
  const wasActive = previousStatus === "active"

  // Update the commitment status
  commitments[idx].status = status

  // Update transformation metrics if completing an active commitment
  const transformation = (state?.transformation ?? {}) as Record<string, unknown>
  if (status === "completed" && wasActive) {
    const completed = ((transformation.assignments_completed as number) ?? 0) + 1
    const given = (transformation.assignments_given as number) ?? 0
    transformation.assignments_completed = completed
    if (given > 0) {
      transformation.completion_rate = completed / given
    }
  }

  // Reassemble state
  const updatedState = {
    ...state,
    commitments,
    transformation,
  }

  const newVersion = version + 1

  // Save
  const { error: updateError } = await serviceClient
    .from("user_state")
    .update({
      state: updatedState,
      version: newVersion,
      updated_at: new Date().toISOString(),
    })
    .eq("provider_user_id", providerUserId)

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to update commitment" },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true })
}
