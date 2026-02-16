import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-auth"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    // Validate auth
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { code } = await request.json()
    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Access code is required" },
        { status: 400 }
      )
    }

    const serviceClient = createServerSupabaseClient()

    // Check if user already redeemed a code
    const { data: existingRedemption } = await serviceClient
      .from("access_code_redemptions")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (existingRedemption) {
      return NextResponse.json({ success: true, message: "Already activated" })
    }

    // Find the access code
    const { data: accessCode, error: codeError } = await serviceClient
      .from("access_codes")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .single()

    if (codeError || !accessCode) {
      return NextResponse.json(
        { error: "Invalid access code" },
        { status: 400 }
      )
    }

    // Validate code state
    if (!accessCode.is_active) {
      return NextResponse.json(
        { error: "This access code is no longer active" },
        { status: 400 }
      )
    }

    if (accessCode.expires_at && new Date(accessCode.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "This access code has expired" },
        { status: 400 }
      )
    }

    if (
      accessCode.max_uses !== null &&
      accessCode.used_count >= accessCode.max_uses
    ) {
      return NextResponse.json(
        { error: "This access code has reached its usage limit" },
        { status: 400 }
      )
    }

    // Create redemption and increment used_count
    const { error: redemptionError } = await serviceClient
      .from("access_code_redemptions")
      .insert({
        code_id: accessCode.id,
        user_id: user.id,
      })

    if (redemptionError) {
      console.error("Redemption error:", redemptionError)
      return NextResponse.json(
        { error: "Failed to redeem code" },
        { status: 500 }
      )
    }

    await serviceClient
      .from("access_codes")
      .update({ used_count: accessCode.used_count + 1 })
      .eq("id", accessCode.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Access code error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
