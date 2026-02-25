"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { createSupabaseServerClient } from "@/lib/supabase-auth"
import type { ChannelPreferences } from "@/lib/types/settings"

export async function getChannelPreferences(): Promise<{
  data: ChannelPreferences | null
  error?: string
}> {
  const authClient = await createSupabaseServerClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()

  if (!user) {
    return { data: null, error: "Not authenticated" }
  }

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from("channel_preferences")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data }
}

export async function upsertChannelPreferences(
  prefs: Partial<ChannelPreferences>
): Promise<{ success?: boolean; error?: string }> {
  const authClient = await createSupabaseServerClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  // Derive provider_user_id from the user's identity
  const providerUserId =
    user.app_metadata?.provider_id || user.user_metadata?.sub || user.id

  const supabase = createServerSupabaseClient()

  const payload = {
    user_id: user.id,
    provider_user_id: providerUserId,
    imessage_enabled: prefs.imessage_enabled ?? false,
    telegram_enabled: prefs.telegram_enabled ?? false,
    whatsapp_enabled: prefs.whatsapp_enabled ?? false,
    google_calendar_enabled: prefs.google_calendar_enabled ?? false,
    imessage_identifier: prefs.imessage_identifier || null,
    telegram_chat_id: prefs.telegram_chat_id || null,
    whatsapp_identifier: prefs.whatsapp_identifier || null,
    google_calendar_email: prefs.google_calendar_email || null,
    email_enabled: prefs.email_enabled ?? false,
    email_address: prefs.email_address || null,
    reminder_frequency: prefs.reminder_frequency ?? "daily",
    quiet_hours_start: prefs.quiet_hours_start ?? "22:00",
    quiet_hours_end: prefs.quiet_hours_end ?? "08:00",
    timezone: prefs.timezone ?? "America/Los_Angeles",
    preferred_channel: prefs.preferred_channel ?? "telegram",
    consent_given_at: prefs.consent_given_at || null,
    consent_text: prefs.consent_text || null,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from("channel_preferences")
    .upsert(payload, { onConflict: "provider_user_id" })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
