import { NextResponse } from "next/server"

const WEBHOOK_URL = process.env.RUMI_MAIL_WEBHOOK

export async function POST(req: Request) {
  try {
    const { name, email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }

    // Notify via Google Apps Script webhook (same pattern as website waitlist)
    if (WEBHOOK_URL) {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          source: "human_coach",
          subject: "You're on the Rumi x Human Life Coach waitlist!",
          template: "coach_waitlist",
        }),
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Coach waitlist notify error:", err)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
