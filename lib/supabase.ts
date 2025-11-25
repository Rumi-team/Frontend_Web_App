import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export const createServerSupabaseClient = () => {
  const cookieStore = cookies()
  return createPagesServerClient({
    supabaseUrl: process.env.NEXT_PUBLIC_rumi_SUPABASE_URL!,
    supabaseKey: process.env.rumi_SUPABASE_SERVICE_ROLE_KEY!,
    cookies: () => cookieStore
  })
}
