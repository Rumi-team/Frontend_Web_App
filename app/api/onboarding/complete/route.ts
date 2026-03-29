import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-auth"
import { createServerSupabaseClient } from "@/lib/supabase"

/** POST: Mark onboarding as complete, set cookie for middleware */
export async function POST() {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const serviceClient = createServerSupabaseClient()
    const { error } = await serviceClient
      .from("user_onboarding")
      .update({ completed_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("completed_at", null)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const response = NextResponse.json({ success: true })
    // Set cookie for middleware check (avoids DB query on every request)
    response.cookies.set("rumi_onboarding_complete", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    })

    return response
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
