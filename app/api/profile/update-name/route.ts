import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-auth"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const name = body.name?.trim()

    if (!name || typeof name !== "string" || name.length > 100) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 })
    }

    const serviceClient = createServerSupabaseClient()

    // Update user_identities display_name
    await serviceClient
      .from("user_identities")
      .update({ display_name: name })
      .eq("user_id", user.id)

    // Update Supabase auth user metadata
    await supabase.auth.updateUser({
      data: { full_name: name },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Update name error:", err)
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    )
  }
}
