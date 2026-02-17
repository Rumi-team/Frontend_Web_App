import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseMiddlewareClient } from "@/lib/supabase-auth"

const ADMIN_EMAIL = "ali@rumi.team"

export async function middleware(request: NextRequest) {
  const { supabase, response } = createSupabaseMiddlewareClient(request)

  // Refresh the auth session cookie so it doesn't expire mid-visit.
  const { data: { user } } = await supabase.auth.getUser()

  // Protect admin routes — only allow ADMIN_EMAIL
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return response
}

export const config = {
  matcher: ["/login/:path*", "/library/:path*", "/admin/:path*"],
}
