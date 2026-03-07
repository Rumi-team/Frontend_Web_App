import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseMiddlewareClient } from "@/lib/supabase-auth"

const ADMIN_EMAIL = "ali@rumi.team"

export async function middleware(request: NextRequest) {
  const { supabase, response } = createSupabaseMiddlewareClient(request)

  // Allow /verify and /api/access-code without access check
  if (
    request.nextUrl.pathname === "/verify" ||
    request.nextUrl.pathname === "/api/access-code"
  ) {
    return response
  }

  // Refresh the auth session cookie so it doesn't expire mid-visit.
  const { data: { user } } = await supabase.auth.getUser()

  // Require authentication for protected routes
  if (!user) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Require access code verification
  if (!user.app_metadata?.access_verified) {
    return NextResponse.redirect(new URL("/verify", request.url))
  }

  // Protect admin routes — only allow ADMIN_EMAIL
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (user.email?.toLowerCase() !== ADMIN_EMAIL) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return response
}

export const config = {
  matcher: ["/rumi/:path*", "/library/:path*", "/settings/:path*", "/admin/:path*", "/verify"],
}
