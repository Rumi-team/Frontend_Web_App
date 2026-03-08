import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseMiddlewareClient } from "@/lib/supabase-auth"

const ADMIN_EMAIL = "ali@rumi.team"

export async function middleware(request: NextRequest) {
  const { supabase, response } = createSupabaseMiddlewareClient(request)
  const pathname = request.nextUrl.pathname

  // Allow public routes without access check
  if (pathname === "/verify" || pathname === "/api/access-code" || pathname === "/login") {
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

  // Routes in the (coach) group that have their own client-side auth gate
  // (CoachShell renders SignInPage for unauthenticated users).
  // Let them through so the sign-in page can render.
  const coachRoutes = ["/rumi", "/library", "/chat", "/settings"]
  const isCoachRoute = coachRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  )

  if (!user && isCoachRoute) {
    // Let the request through — the layout will render the sign-in page
    return response
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
  matcher: ["/", "/rumi/:path*", "/library/:path*", "/chat/:path*", "/settings/:path*", "/admin/:path*", "/verify", "/login"],
}
