/**
 * GET /api/cron/reminders
 *
 * Vercel Cron job — runs every 5 minutes.
 * Queries scheduled_reminders for pending rows where scheduled_at <= now,
 * delivers via lib/openclaw/send.ts, and updates row status.
 *
 * Security: Vercel injects Authorization: Bearer <CRON_SECRET> on cron calls.
 * Unauthorized requests receive 401.
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendMessage } from "@/lib/openclaw/send"

const MAX_BATCH = 50
const MAX_ATTEMPTS = 3

export async function GET(req: NextRequest) {
  // Verify Vercel cron secret
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceKey)
  const now = new Date().toISOString()

  // Fetch pending reminders due now, skipping rows that have exhausted retries
  const { data: reminders, error } = await supabase
    .from("scheduled_reminders")
    .select("id, provider_user_id, channel, message, attempts")
    .eq("status", "pending")
    .lte("scheduled_at", now)
    .lt("attempts", MAX_ATTEMPTS)
    .order("scheduled_at", { ascending: true })
    .limit(MAX_BATCH)

  if (error) {
    console.error("[cron/reminders] Failed to fetch reminders:", error)
    return NextResponse.json({ error: "DB query failed" }, { status: 500 })
  }

  if (!reminders || reminders.length === 0) {
    return NextResponse.json({ processed: 0 })
  }

  // Load channel_preferences for each unique user (to get target identifier)
  const userIds = [...new Set(reminders.map((r: any) => r.provider_user_id))]
  const { data: prefs } = await supabase
    .from("channel_preferences")
    .select("provider_user_id, telegram_chat_id, whatsapp_identifier, email_address, imessage_identifier")
    .in("provider_user_id", userIds)

  const prefMap = new Map<string, any>((prefs ?? []).map((p: any) => [p.provider_user_id, p]))

  let sent = 0
  let failed = 0

  for (const reminder of reminders as any[]) {
    const userPrefs = prefMap.get(reminder.provider_user_id)

    // Increment attempts regardless of outcome
    await supabase
      .from("scheduled_reminders")
      .update({ attempts: reminder.attempts + 1, last_attempt_at: new Date().toISOString() })
      .eq("id", reminder.id)

    if (!userPrefs) {
      // No channel preferences found — mark failed
      await supabase
        .from("scheduled_reminders")
        .update({ status: "failed", error_message: "No channel_preferences row found" })
        .eq("id", reminder.id)
      failed++
      continue
    }

    // Resolve target from channel_preferences
    const target = getTarget(reminder.channel, userPrefs)
    if (!target) {
      await supabase
        .from("scheduled_reminders")
        .update({ status: "failed", error_message: `No ${reminder.channel} identifier in preferences` })
        .eq("id", reminder.id)
      failed++
      continue
    }

    const result = await sendMessage(reminder.channel, target, reminder.message)

    if (result.success) {
      await supabase
        .from("scheduled_reminders")
        .update({ status: "sent" })
        .eq("id", reminder.id)

      // Audit log
      await supabase.from("reminder_logs").insert({
        reminder_id: reminder.id,
        provider_user_id: reminder.provider_user_id,
        channel: reminder.channel,
        message_preview: reminder.message.slice(0, 200),
        status: "sent",
      })
      sent++
    } else {
      // Only mark failed after MAX_ATTEMPTS
      if (reminder.attempts + 1 >= MAX_ATTEMPTS) {
        await supabase
          .from("scheduled_reminders")
          .update({ status: "failed", error_message: result.error ?? "Delivery failed" })
          .eq("id", reminder.id)
      }

      await supabase.from("reminder_logs").insert({
        reminder_id: reminder.id,
        provider_user_id: reminder.provider_user_id,
        channel: reminder.channel,
        message_preview: reminder.message.slice(0, 200),
        status: "failed",
        error_message: result.error,
      })
      failed++
    }
  }

  return NextResponse.json({ processed: reminders.length, sent, failed })
}

function getTarget(channel: string, prefs: any): string | null {
  switch (channel) {
    case "telegram":
      return prefs.telegram_chat_id ?? null
    case "whatsapp":
      return prefs.whatsapp_identifier ?? null
    case "email":
      return prefs.email_address ?? null
    case "imessage":
      return prefs.imessage_identifier ?? null
    default:
      return null
  }
}
