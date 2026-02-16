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
    const identity = user.identities?.[0]
    const email = user.email ?? identity?.identity_data?.email ?? ""
    const providerUserId =
      identity?.identity_data?.sub ?? identity?.id ?? user.id

    // Upsert into user_identities with platform='web'
    await serviceClient.from("user_identities").upsert(
      {
        user_id: user.id,
        provider: identity?.provider ?? "google",
        provider_user_id: providerUserId,
        email,
        platform: "web",
      },
      { onConflict: "user_id" }
    )
  }

  return NextResponse.redirect(`${origin}${next}`)
}
