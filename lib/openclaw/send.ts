/**
 * lib/openclaw/send.ts
 *
 * Shared delivery utility for all OpenClaw channels.
 * Used by both /api/openclaw/send (user-triggered) and /api/cron/reminders (scheduled).
 * Keeping logic here avoids the cron runner making a self-referential HTTP call.
 */

export interface SendResult {
  success: boolean
  response?: string
  error?: string
}

export async function sendViaTelegram(
  target: string,
  message: string
): Promise<SendResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return { success: false, error: "TELEGRAM_BOT_TOKEN not configured" }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: target, text: message }),
  })
  const data = await res.json()
  if (!res.ok) return { success: false, error: JSON.stringify(data) }
  return { success: true, response: `Telegram message sent to chat_id ${target}` }
}

export async function sendViaEmail(
  target: string,
  message: string,
  subject?: string
): Promise<SendResult> {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT ?? "587", 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM ?? user

  if (!host || !user || !pass) {
    return { success: false, error: "SMTP credentials not configured (SMTP_HOST, SMTP_USER, SMTP_PASS)" }
  }

  try {
    // Dynamic import to avoid loading nodemailer at module init (it's heavy)
    const nodemailer = await import("nodemailer")
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    })

    await transporter.sendMail({
      from,
      to: target,
      subject: subject ?? "A message from Rumi, your coaching companion",
      text: message,
    })

    return { success: true, response: `Email sent to ${target}` }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { success: false, error: msg }
  }
}

export async function sendViaWhatsApp(
  target: string,
  message: string
): Promise<SendResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_WHATSAPP_FROM ?? "whatsapp:+14155238886"

  if (!accountSid || !authToken) {
    return { success: false, error: "Twilio credentials not configured" }
  }

  const to = target.startsWith("whatsapp:") ? target : `whatsapp:${target}`
  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64")

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({ From: from, To: to, Body: message }),
    }
  )
  const data = await res.json()
  if (!res.ok) return { success: false, error: JSON.stringify(data) }
  return { success: true, response: `WhatsApp message sent to ${target}` }
}

export async function sendMessage(
  channel: string,
  target: string,
  message: string,
  subject?: string
): Promise<SendResult> {
  switch (channel) {
    case "telegram":
      return sendViaTelegram(target, message)
    case "email":
      return sendViaEmail(target, message, subject)
    case "whatsapp":
      return sendViaWhatsApp(target, message)
    default:
      return { success: false, error: `Unsupported channel: ${channel}` }
  }
}
