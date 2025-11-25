"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export const createBrowserSupabaseClient = () => {
  return createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_rumi_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_rumi_SUPABASE_ANON_KEY!
  })
}
