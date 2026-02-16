import { type NextRequest } from "next/server"
import { createSupabaseMiddlewareClient } from "@/lib/supabase-auth"

export async function middleware(request: NextRequest) {
  const { supabase, response } = createSupabaseMiddlewareClient(request)

  // Refresh the auth session cookie so it doesn't expire mid-visit.
  // This must run on every matched request — even if we don't read the session.
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: ["/coach/:path*", "/library/:path*"],
}
