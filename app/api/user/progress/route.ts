import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-auth"

export async function PATCH(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { xp, streak, word_count, sessions_completed, last_session_date } = body

  const { error } = await supabase
    .from("user_progress")
    .upsert(
      {
        user_id: user.id,
        xp,
        streak,
        word_count,
        sessions_completed,
        last_session_date,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
