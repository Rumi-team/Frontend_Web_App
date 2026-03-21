import { createSupabaseServerClient } from "@/lib/supabase-auth"
import { CoachShell } from "./coach-shell"

const isE2ETesting =
  process.env.E2E_BYPASS_AUTH === "true" &&
  process.env.NODE_ENV === "development"

export default async function CoachLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (isE2ETesting) {
    return (
      <CoachShell authenticated={true}>
        {children}
      </CoachShell>
    )
  }

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
