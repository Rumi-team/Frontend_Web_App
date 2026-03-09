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
    return <CoachShell authenticated={false}>{children}</CoachShell>
  }

  let needsOnboarding = false

  try {
    const serviceClient = createServerSupabaseClient()

    // Check if user has completed channel onboarding (channel_preferences row exists)
    const providerUserId =
      user.app_metadata?.provider_id ?? user.user_metadata?.sub ?? user.id
    const { data: channelPrefs } = await serviceClient
      .from("channel_preferences")
      .select("id")
      .eq("provider_user_id", providerUserId)
      .maybeSingle()
    needsOnboarding = !channelPrefs
  } catch (err) {
    console.error("[CoachLayout] DB lookup failed:", err)
  }

  return (
    <CoachShell authenticated={true} needsOnboarding={needsOnboarding}>
      {children}
    </CoachShell>
  )
}
