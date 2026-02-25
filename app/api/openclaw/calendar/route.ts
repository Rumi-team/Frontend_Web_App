import { NextRequest, NextResponse } from "next/server"

interface CalendarBody {
  email?: string
  title?: string
  description?: string
  deadline?: string // ISO 8601 datetime string
}

export async function POST(req: NextRequest) {
  let body: CalendarBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { email, title, description, deadline } = body

  if (!email || !title || !deadline) {
    return NextResponse.json(
      { error: "Missing required fields: email, title, deadline" },
      { status: 400 }
    )
  }

  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_CALENDAR_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    return NextResponse.json(
      { error: "Google Calendar credentials not configured" },
      { status: 500 }
    )
  }

  // Exchange refresh token for access token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  })

  const tokenData = await tokenRes.json()
  if (!tokenRes.ok || !tokenData.access_token) {
    return NextResponse.json(
      { error: "Failed to get Google access token", details: tokenData },
      { status: 502 }
    )
  }

  const accessToken: string = tokenData.access_token

  // Build event — deadline is both start and end (all-day deadline marker)
  const deadlineDate = new Date(deadline)
  const endDate = new Date(deadlineDate.getTime() + 60 * 60 * 1000) // +1 hour

  const event = {
    summary: title,
    description: description ?? "",
    start: { dateTime: deadlineDate.toISOString(), timeZone: "UTC" },
    end: { dateTime: endDate.toISOString(), timeZone: "UTC" },
    attendees: [{ email }],
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 24 * 60 },
        { method: "popup", minutes: 60 },
      ],
    },
  }

  const calendarRes = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  )

  const calendarData = await calendarRes.json()

  if (!calendarRes.ok) {
    return NextResponse.json(
      { error: "Google Calendar API error", details: calendarData },
      { status: 502 }
    )
  }

  return NextResponse.json({
    success: true,
    eventId: calendarData.id,
    htmlLink: calendarData.htmlLink,
  })
}
