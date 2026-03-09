import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-auth"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    // Verify the user is actually authenticated
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

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

    // Upsert user_identities — increment login_count or insert new
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
        provider: identity?.provider ?? "email",
        provider_user_id: providerUserId,
        email,
        platform: "web",
        login_count: 1,
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Post sign-in error:", err)
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    )
  }
}
