"use server"

import { createServerSupabaseClient } from "@/lib/supabase"

// Characters that avoid ambiguity: no O/0, I/1, l
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

function generateCode(length = 8): string {
  let code = ""
  for (let i = 0; i < length; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return code
}

export async function generateAccessCode(
  description?: string,
  maxUses?: number,
  expiresAt?: string,
  assignedEmail?: string
) {
  const supabase = createServerSupabaseClient()
  const code = generateCode()

  const { data, error } = await supabase
    .from("access_codes")
    .insert({
      code,
      description: description || null,
      max_uses: maxUses || null,
      expires_at: expiresAt || null,
      assigned_email: assignedEmail?.toLowerCase().trim() || null,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function listAccessCodes() {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("access_codes")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return { error: error.message, data: [] }
  }

  return { data: data ?? [] }
}

export async function toggleAccessCode(id: string, isActive: boolean) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase
    .from("access_codes")
    .update({ is_active: isActive })
    .eq("id", id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function deleteAccessCode(id: string) {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("access_codes").delete().eq("id", id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export interface UserActivity {
  user_id: string
  email: string
  provider: string
  platform: string
  login_count: number
  created_at: string
  session_count: number
  last_session_at: string | null
}

export async function listUserActivity(): Promise<{
  data: UserActivity[]
  error?: string
}> {
  const supabase = createServerSupabaseClient()

  // Get all web user identities
  const { data: users, error: usersError } = await supabase
    .from("user_identities")
    .select("user_id, email, provider, platform, login_count, created_at")
    .eq("platform", "web")
    .order("created_at", { ascending: false })

  if (usersError) {
    return { error: usersError.message, data: [] }
  }

  if (!users || users.length === 0) {
    return { data: [] }
  }

  // Get session counts per user
  const userIds = users.map((u) => u.user_id)
  const { data: sessions } = await supabase
    .from("session_summaries")
    .select("user_id, session_started_at")
    .in("user_id", userIds)
    .eq("platform", "web")
    .order("session_started_at", { ascending: false })

  // Aggregate session data per user
  const sessionMap = new Map<
    string,
    { count: number; lastAt: string | null }
  >()
  for (const s of sessions ?? []) {
    const existing = sessionMap.get(s.user_id)
    if (existing) {
      existing.count++
    } else {
      sessionMap.set(s.user_id, {
        count: 1,
        lastAt: s.session_started_at,
      })
    }
  }

  const result: UserActivity[] = users.map((u) => ({
    user_id: u.user_id,
    email: u.email ?? "",
    provider: u.provider ?? "google",
    platform: u.platform ?? "web",
    login_count: u.login_count ?? 0,
    created_at: u.created_at,
    session_count: sessionMap.get(u.user_id)?.count ?? 0,
    last_session_at: sessionMap.get(u.user_id)?.lastAt ?? null,
  }))

  return { data: result }
}
