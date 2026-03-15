import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseMiddlewareClient } from "@/lib/supabase-auth"

const ADMIN_EMAIL = "ali@rumi.team"

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // OAuth PKCE callback lands on root with ?code= — redirect to /login so the
  // login page's client-side exchangeCodeForSession handler can process it.
  // Must happen BEFORE creating the Supabase client to avoid double-exchange.
  if (pathname === "/" && request.nextUrl.searchParams.has("code")) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.search = request.nextUrl.search
    return NextResponse.redirect(loginUrl)
  }

  const { supabase, response } = createSupabaseMiddlewareClient(request)

  // Login page — if already authenticated, skip to /rumi
  // Otherwise allow through (including ?code= for PKCE exchange)
  if (pathname === "/login") {
    const { data: { user } } = await supabase.auth.getUser()
    if (user && !request.nextUrl.searchParams.has("code")) {
      return NextResponse.redirect(new URL("/rumi", request.url))
    }
    return response
  }

  // Landing page — if user is authenticated, redirect to /rumi (start view)
  if (pathname === "/") {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      return NextResponse.redirect(new URL("/rumi", request.url))
    }
    return response
  }

  // Refresh the auth session cookie so it doesn't expire mid-visit.
  const { data: { user } } = await supabase.auth.getUser()

  // Protected coach routes — redirect to /login if not authenticated
  const coachRoutes = ["/rumi", "/library", "/chat", "/settings"]
  const isCoachRoute = coachRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  )

  if (!user && isCoachRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Require authentication for other protected routes (e.g. /admin)
  if (!user) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Protect admin routes — only allow ADMIN_EMAIL
  if (pathname.startsWith("/admin")) {
    if (user.email?.toLowerCase() !== ADMIN_EMAIL) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return response
}

export const config = {
  matcher: ["/", "/rumi/:path*", "/library/:path*", "/chat/:path*", "/settings/:path*", "/admin/:path*", "/login"],
}
