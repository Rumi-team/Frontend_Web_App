import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Telegram sends POST updates to this webhook.
// When a user sends /start to the bot, we capture their numeric chat_id
// and update channel_preferences.telegram_chat_id for the matching phone number.
export async function POST(req: NextRequest) {
  let update: {
    message?: {
      chat?: { id?: number; username?: string }
      from?: { id?: number; username?: string; phone_number?: string }
      text?: string
      contact?: { phone_number?: string; user_id?: number }
    }
  }

  try {
    update = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const message = update?.message
  if (!message) {
    // Not a message update — silently acknowledge
    return NextResponse.json({ ok: true })
  }

  const chatId = message.chat?.id
  const text = message.text ?? ""

  if (!chatId) {
    return NextResponse.json({ ok: true })
  }

  // Only process /start command
  if (!text.startsWith("/start")) {
    return NextResponse.json({ ok: true })
  }

  // Try to find the user by Telegram username or phone via contact share
  // The bot flow: user sends /start → we store their chat_id indexed by chat_id itself.
  // The Python backend stores the chat_id in channel_preferences.telegram_chat_id.
  // We update any row that currently has a placeholder matching the Telegram username
  // OR the numeric chat_id string if it was already set correctly.

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("[telegram-webhook] Supabase credentials not configured")
    return NextResponse.json({ ok: true })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const username = message.from?.username

  if (username) {
    // Update any row where telegram_chat_id matches the username (e.g., "@username" or "username")
    const { error } = await supabase
      .from("channel_preferences")
      .update({ telegram_chat_id: String(chatId) })
      .or(`telegram_chat_id.eq.@${username},telegram_chat_id.eq.${username}`)

    if (error) {
      console.error("[telegram-webhook] Supabase update error:", error)
    }
  }

  // Send welcome message back to user
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (token) {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: "You're connected to Rumi! You'll receive your coaching reminders and assignment updates here.",
      }),
    }).catch(() => {/* fire and forget */})
  }

  return NextResponse.json({ ok: true })
}
