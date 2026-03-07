import { exec } from "child_process"
import { promisify } from "util"
import { NextRequest, NextResponse } from "next/server"
import { sendViaTelegram, sendViaEmail, sendViaWhatsApp } from "@/lib/openclaw/send"

const execAsync = promisify(exec)

export async function POST(req: NextRequest) {
  let body: { channel?: string; target?: string; message?: string; subject?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { channel, target, message, subject } = body

  if (!channel || !target || !message) {
    return NextResponse.json(
      { error: "Missing required fields: channel, target, message" },
      { status: 400 }
    )
  }

  try {
    switch (channel) {
      case "telegram": {
        const result = await sendViaTelegram(target, message)
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 502 })
        }
        return NextResponse.json({ success: true, response: result.response })
      }

      case "email": {
        const result = await sendViaEmail(target, message, subject)
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: result.error?.includes("not configured") ? 500 : 502 })
        }
        return NextResponse.json({ success: true, response: result.response })
      }

      case "whatsapp": {
        const result = await sendViaWhatsApp(target, message)
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: result.error?.includes("not configured") ? 500 : 502 })
        }
        return NextResponse.json({ success: true, response: result.response })
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

      default:
        return NextResponse.json(
          { error: `Unsupported channel: ${channel}` },
          { status: 400 }
        )
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
