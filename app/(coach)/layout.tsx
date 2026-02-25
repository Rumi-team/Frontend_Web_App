import { createSupabaseServerClient } from "@/lib/supabase-auth"
import { createServerSupabaseClient } from "@/lib/supabase"
import { CoachShell } from "./coach-shell"

export default async function CoachLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <CoachShell authenticated={false} hasAccess={false}>{children}</CoachShell>
  }

  const serviceClient = createServerSupabaseClient()

  // Check if user has an active access code (is_active = true)
  const userEmail = user.email?.toLowerCase() ?? ""
  const { data: accessCode } = await serviceClient
    .from("access_codes")
    .select("is_active")
    .eq("assigned_email", userEmail)
    .single()

  // Also check for legacy redemption-based access
  const { data: redemption } = await serviceClient
    .from("access_code_redemptions")
    .select("id")
    .eq("user_id", user.id)
    .single()

  const hasAccess = accessCode?.is_active === true || !!redemption

  // Check if user has completed channel onboarding (channel_preferences row exists)
  let needsOnboarding = false
  if (hasAccess) {
    const providerUserId =
      user.app_metadata?.provider_id ?? user.user_metadata?.sub ?? user.id
    const { data: channelPrefs } = await serviceClient
      .from("channel_preferences")
      .select("id")
      .eq("provider_user_id", providerUserId)
      .maybeSingle()
    needsOnboarding = !channelPrefs
  }

  return (
    <CoachShell authenticated={true} hasAccess={hasAccess} needsOnboarding={needsOnboarding}>
      {children}
    </CoachShell>
  )
}
