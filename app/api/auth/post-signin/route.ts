import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-auth"
import { createServerSupabaseClient } from "@/lib/supabase"

// Characters that avoid ambiguity: no O/0, I/1, l
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

function generateCode(length = 8): string {
  let code = ""
  for (let i = 0; i < length; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  }
  return code
}

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

    // Auto-match: check if this email has an assigned access code
    const { data: existingRedemption } = await serviceClient
      .from("access_code_redemptions")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle()

    if (!existingRedemption && email) {
      const { data: assignedCode } = await serviceClient
        .from("access_codes")
        .select("id, used_count")
        .eq("assigned_email", email.toLowerCase())
        .eq("is_active", true)
        .maybeSingle()

      if (assignedCode) {
        await serviceClient.from("access_code_redemptions").insert({
          code_id: assignedCode.id,
          user_id: user.id,
        })

        await serviceClient
          .from("access_codes")
          .update({ used_count: (assignedCode.used_count ?? 0) + 1 })
          .eq("id", assignedCode.id)
      }
    }

    // Rotate auto code on every login: deactivate old auto codes, insert fresh one.
    // This ensures the admin always sees a single current code per user.
    // Manual codes assigned by admins (code_type='manual') are never touched.
    if (email) {
      const emailLower = email.toLowerCase()

      // Deactivate all existing auto codes for this email
      await serviceClient
        .from("access_codes")
        .update({ is_active: false })
        .eq("assigned_email", emailLower)
        .eq("code_type", "auto")

      // Insert a fresh auto code (inactive by default — admin activates to grant access)
      await serviceClient.from("access_codes").insert({
        code: generateCode(),
        description: `Auto - ${email}`,
        is_active: false,
        assigned_email: emailLower,
        code_type: "auto",
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
