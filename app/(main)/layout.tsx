import { createSupabaseServerClient } from "@/lib/supabase-auth"
import { AppLayoutClient } from "@/components/app/AppLayoutClient"

const isE2ETesting =
  process.env.E2E_BYPASS_AUTH === "true" &&
  process.env.NODE_ENV === "development"

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (isE2ETesting) {
    return <AppLayoutClient authenticated={true}>{children}</AppLayoutClient>
  }

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return <AppLayoutClient authenticated={!!user}>{children}</AppLayoutClient>
}
