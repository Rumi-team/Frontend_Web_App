import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-auth"

export async function PATCH(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()

  const ALLOWED_KEYS = [
    "selectedVoice", "aiStyle", "radarCalibration", "customInstructions",
    "selectedTheme", "lightDark", "homeScreenQuote", "streakCelebration",
    "activeQuests", "appLock", "backgroundMusic", "particles", "edgeGlow",
    "hapticFeedback", "showAvatar",
  ]
  const sanitized = Object.fromEntries(
    Object.entries(body).filter(([k]) => ALLOWED_KEYS.includes(k))
  )

  const { error } = await supabase
    .from("user_settings")
    .upsert(
      {
        user_id: user.id,
        ...sanitized,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
