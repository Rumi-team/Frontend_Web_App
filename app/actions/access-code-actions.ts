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
  expiresAt?: string
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
