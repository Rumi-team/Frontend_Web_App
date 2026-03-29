import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase-auth"

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // E2E bypass
  if (process.env.E2E_BYPASS_AUTH === "true" && process.env.NODE_ENV === "development") {
    return <div className="min-h-[100dvh] bg-[#080808]">{children}</div>
  }

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/welcome")
  }

  return <div className="min-h-[100dvh] bg-[#080808]">{children}</div>
}
