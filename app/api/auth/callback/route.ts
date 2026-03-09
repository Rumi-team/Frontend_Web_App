import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-auth"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/rumi"

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  // Exchange the OAuth code for a Supabase session (sets cookies)
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error("OAuth callback error:", error.message)
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
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
    const { data: existingIdentity } = await serviceClient
      .from("user_identities")
      .select("login_count")
      .eq("user_id", user.id)
      .single()

    if (existingIdentity) {
      await serviceClient
        .from("user_identities")
        .update({
          login_count: (existingIdentity.login_count ?? 0) + 1,
          email,
          provider_user_id: providerUserId,
        })
        .eq("user_id", user.id)
    } else {
      await serviceClient.from("user_identities").insert({
        user_id: user.id,
        provider: identity?.provider ?? "google",
        provider_user_id: providerUserId,
        email,
        platform: "web",
        login_count: 1,
      })
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
