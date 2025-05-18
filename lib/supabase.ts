import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export const createServerSupabaseClient = () => {
  const cookieStore = cookies()
  return createPagesServerClient({ cookies: () => cookieStore })
}
