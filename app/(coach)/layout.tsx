import { redirect } from "next/navigation"
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
    // Not authenticated — the shell will show sign-in UI
    return <CoachShell authenticated={false} hasAccess={false}>{children}</CoachShell>
  }

  // Check access code redemption
  const serviceClient = createServerSupabaseClient()
  const { data: redemption } = await serviceClient
    .from("access_code_redemptions")
    .select("id")
    .eq("user_id", user.id)
    .single()

  return (
    <CoachShell authenticated={true} hasAccess={!!redemption}>
      {children}
    </CoachShell>
  )
}
