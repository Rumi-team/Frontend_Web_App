import { createSupabaseServerClient } from "@/lib/supabase-auth"
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

  return (
    <CoachShell authenticated={!!user}>
      {children}
    </CoachShell>
  )
}
