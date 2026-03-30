import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseMiddlewareClient } from "@/lib/supabase-auth"

const ADMIN_EMAIL = "ali@rumi.team"

// E2E testing bypass — only active in local development (NODE_ENV guard)
// NEVER runs in production (Vercel sets NODE_ENV=production always)
const isE2ETesting =
  process.env.E2E_BYPASS_AUTH === "true" &&
  process.env.NODE_ENV === "development"

const isE2EBypassOnboarding =
  process.env.E2E_BYPASS_ONBOARDING === "true" &&
  process.env.NODE_ENV === "development"

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // E2E mode: skip all auth checks, pass every request through
  if (isE2ETesting) {
    return NextResponse.next()
  }

  // OAuth PKCE callback lands on root with ?code= — redirect to /login so the
  // login page's client-side exchangeCodeForSession handler can process it.
  // Must happen BEFORE creating the Supabase client to avoid double-exchange.
  if (pathname === "/" && request.nextUrl.searchParams.has("code")) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.search = request.nextUrl.search
    return NextResponse.redirect(loginUrl)
  }

  const { supabase, response } = createSupabaseMiddlewareClient(request)

  // Login page — if already authenticated, skip to /phone (or /onboarding if not completed)
  // Otherwise allow through (including ?code= for PKCE exchange)
  if (pathname === "/login") {
    const { data: { user } } = await supabase.auth.getUser()
    if (user && !request.nextUrl.searchParams.has("code")) {
      const dest = request.cookies.get("rumi_onboarding_complete") ? "/phone" : "/onboarding"
      return NextResponse.redirect(new URL(dest, request.url))
    }
    return response
  }

  // Landing page — if user is authenticated, redirect to /phone (or /onboarding)
  if (pathname === "/") {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const dest = request.cookies.get("rumi_onboarding_complete") ? "/phone" : "/onboarding"
      return NextResponse.redirect(new URL(dest, request.url))
    }
    return response
  }

  // Legacy /rumi route redirect — catches existing bookmarks
  if (pathname === "/rumi" || pathname.startsWith("/rumi/")) {
    return NextResponse.redirect(new URL("/phone", request.url))
  }

  // Welcome + onboarding pages — pass through without auth
  if (pathname === "/welcome" || pathname.startsWith("/welcome/")) {
    return response
  }

  // Refresh the auth session cookie so it doesn't expire mid-visit.
  const { data: { user } } = await supabase.auth.getUser()

  // Protected coach routes — redirect to /login if not authenticated
  const coachRoutes = ["/rumi", "/library", "/chat", "/settings", "/phone", "/text", "/content", "/you", "/preferences"]
  const isCoachRoute = coachRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  )

  if (!user && isCoachRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Onboarding gate — redirect to /onboarding if not completed
  // Uses cookie (no DB query) set by POST /api/onboarding/complete
  if (user && isCoachRoute && !isE2ETesting && !isE2EBypassOnboarding) {
    const onboardingComplete = request.cookies.get("rumi_onboarding_complete")
    if (!onboardingComplete) {
      return NextResponse.redirect(new URL("/onboarding", request.url))
    }
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
  matcher: ["/", "/rumi/:path*", "/library/:path*", "/chat/:path*", "/settings/:path*", "/phone/:path*", "/text/:path*", "/content/:path*", "/you/:path*", "/preferences/:path*", "/admin/:path*", "/login", "/onboarding/:path*", "/welcome/:path*"],
}
