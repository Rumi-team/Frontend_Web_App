import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-auth"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/coach"

  if (!code) {
    return NextResponse.redirect(`${origin}/coach?error=missing_code`)
  }

  // Exchange the OAuth code for a Supabase session (sets cookies)
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error("OAuth callback error:", error.message)
    return NextResponse.redirect(`${origin}/coach?error=auth_failed`)
  }

  // Get the authenticated user to upsert user_identities
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const serviceClient = createServerSupabaseClient()
    // Resolve correct provider ID: prefer Apple/Google identity over email
    const identities = user.identities ?? []
    const oauthIdentity =
      identities.find((i) => i.provider === "apple") ??
      identities.find((i) => i.provider === "google") ??
      identities[0]
    const identity = oauthIdentity ?? identities[0]
    const email = user.email ?? identity?.identity_data?.email ?? ""
    const providerUserId =
      (oauthIdentity?.identity_data?.sub as string) ??
      (user.user_metadata?.sub as string) ??
      identity?.id ??
      user.id

    // Upsert into user_identities with platform='web'
    // If existing row, increment login_count
    const { data: existingIdentity } = await serviceClient
      .from("user_identities")
      .select("login_count")
      .eq("user_id", user.id)
      .single()

    if (existingIdentity) {
      // Existing user — increment login count
      await serviceClient
        .from("user_identities")
        .update({
          login_count: (existingIdentity.login_count ?? 0) + 1,
          email,
          provider_user_id: providerUserId,
        })
        .eq("user_id", user.id)
    } else {
      // New user — insert with login_count = 1
      await serviceClient.from("user_identities").insert({
        user_id: user.id,
        provider: identity?.provider ?? "google",
        provider_user_id: providerUserId,
        email,
        platform: "web",
        login_count: 1,
      })
    }

    // Auto-match: check if this email has an assigned access code
    const { data: existingRedemption } = await serviceClient
      .from("access_code_redemptions")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (!existingRedemption) {
      // No redemption yet — look for an access code assigned to this email
      const { data: assignedCode } = await serviceClient
        .from("access_codes")
        .select("id, used_count")
        .eq("assigned_email", email.toLowerCase())
        .eq("is_active", true)
        .single()

      if (assignedCode) {
        // Auto-redeem the code for this user
        await serviceClient.from("access_code_redemptions").insert({
          code_id: assignedCode.id,
          user_id: user.id,
        })

        // Increment used_count
        await serviceClient
          .from("access_codes")
          .update({ used_count: (assignedCode.used_count ?? 0) + 1 })
          .eq("id", assignedCode.id)
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
