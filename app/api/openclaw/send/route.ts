import { exec } from "child_process"
import { promisify } from "util"
import { NextRequest, NextResponse } from "next/server"

const execAsync = promisify(exec)

export async function POST(req: NextRequest) {
  let body: { channel?: string; target?: string; message?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { channel, target, message } = body

  if (!channel || !target || !message) {
    return NextResponse.json(
      { error: "Missing required fields: channel, target, message" },
      { status: 400 }
    )
  }

  try {
    switch (channel) {
      case "telegram": {
        const token = process.env.TELEGRAM_BOT_TOKEN
        if (!token) {
          return NextResponse.json(
            { error: "TELEGRAM_BOT_TOKEN not configured" },
            { status: 500 }
          )
        }

        const telegramRes = await fetch(
          `https://api.telegram.org/bot${token}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: target, text: message }),
          }
        )
        const telegramData = await telegramRes.json()

        if (!telegramRes.ok) {
          return NextResponse.json(
            { error: "Telegram API error", details: telegramData },
            { status: 502 }
          )
        }

        return NextResponse.json({
          success: true,
          response: `Telegram message sent to chat_id ${target}`,
        })
      }

      case "imessage": {
        // Sanitize inputs to prevent AppleScript injection
        const safeTarget = target.replace(/['"\\]/g, "")
        const safeMessage = message.replace(/\\/g, "\\\\").replace(/"/g, '\\"')

        const script = `tell application "Messages"
  set targetService to first service whose service type is iMessage
  set targetBuddy to buddy "${safeTarget}" of targetService
  send "${safeMessage}" to targetBuddy
end tell`

        await execAsync(`osascript -e '${script.replace(/'/g, "'\\''")}'`)

        return NextResponse.json({
          success: true,
          response: `iMessage sent to ${target}`,
        })
      }

      case "whatsapp": {
        const accountSid = process.env.TWILIO_ACCOUNT_SID
        const authToken = process.env.TWILIO_AUTH_TOKEN
        const from = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886"

        if (!accountSid || !authToken) {
          return NextResponse.json(
            { error: "Twilio credentials not configured" },
            { status: 500 }
          )
        }

        const to = target.startsWith("whatsapp:") ? target : `whatsapp:${target}`
        const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64")

        const twilioRes = await fetch(
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
        const twilioData = await twilioRes.json()

        if (!twilioRes.ok) {
          return NextResponse.json(
            { error: "Twilio API error", details: twilioData },
            { status: 502 }
          )
        }

        return NextResponse.json({
          success: true,
          response: `WhatsApp message sent to ${target}`,
        })
      }

      case "email": {
        const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL
        const apiKey = process.env.OPENCLAW_API_KEY
        if (!gatewayUrl || !apiKey) {
          return NextResponse.json(
            { error: "OpenClaw gateway not configured" },
            { status: 500 }
          )
        }

        const emailRes = await fetch(`${gatewayUrl}/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": apiKey,
          },
          body: JSON.stringify({ channel: "email", target, message }),
        })
        const emailData = await emailRes.json()

        if (!emailRes.ok) {
          return NextResponse.json(
            { error: "Email gateway error", details: emailData },
            { status: 502 }
          )
        }

        return NextResponse.json({
          success: true,
          response: `Email sent to ${target}`,
        })
      }

      default:
        return NextResponse.json(
          { error: `Unsupported channel: ${channel}` },
          { status: 400 }
        )
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
