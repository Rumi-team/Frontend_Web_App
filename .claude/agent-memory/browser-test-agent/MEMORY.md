# Browser Test Agent Memory

## Environment Limitation
No Puppeteer/headless browser MCP tool is available in this environment. Browser testing must use:
- `WebFetch` for static HTML inspection (returns SSR skeleton only, no JS-rendered content)
- `mcp__claude_ai_Supabase__execute_sql` for DB-level validation
- Source code reading for logic analysis
- Screenshots not possible for live web flows without Puppeteer

## App: Frontend_Web_App (https://www.rumi.team)

### Routes
- `/` — Landing page (marketing, SSR, shows "Sign In" button; redirects auth'd users to /rumi via middleware)
- `/login` — Standalone login page (`app/login/page.tsx`); Google + Apple OAuth buttons; PKCE code exchange
- `/rumi` — Main coaching page (`app/(coach)/rumi/page.tsx`); Yellow Orb (StartView); requires auth + access code
- `/library`, `/chat`, `/settings` — Coach sub-pages with nav bar
- `/admin/*` — Admin-only (ali@rumi.team)

### Auth Flow (PKCE)
1. User clicks "Continue with Google" on /login or /rumi (SignInPage via CoachShell)
2. `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: siteUrl + '/login', skipBrowserRedirect: true } })`
3. Browser redirects to Google, user authenticates
4. Google redirects back to `/login?code=...`
5. `login/page.tsx` calls `supabase.auth.exchangeCodeForSession(code)` → session established
6. `router.replace('/rumi')` → user lands on /rumi
7. CoachLayout (server) checks auth + access_codes + access_code_redemptions → passes `authenticated=true, hasAccess=true/false` to CoachShell
8. CoachShell renders: Yellow Orb (StartView) if fully authorized, AccessCodeGate if no access

### Access Control
- `access_codes` table: `assigned_email` + `is_active` — ali@rumi.team has `is_active=true`, code=RUMIALI
- `access_code_redemptions` table: fallback check by user_id
- `channel_preferences` table: if missing → ChannelOnboarding shown before Orb

### Key Files
- `app/login/page.tsx` — standalone login with PKCE exchange
- `app/(coach)/layout.tsx` — server-side auth + access check
- `app/(coach)/coach-shell.tsx` — client gate (SignInPage / AccessCodeGate / ChannelOnboarding / content)
- `components/auth-provider.tsx` — client auth context, also handles PKCE code exchange on mount
- `middleware.ts` — session refresh; / redirects authed users to /rumi; coach routes let through unauthenticated (CoachShell handles gate)
- `components/coach/start-view.tsx` — Yellow Orb component (SVG circle fill `rgba(247, 209, 66, 0.95)`)

### Supabase
- Project: xdaxseboeioleiguqfkg (coaching app)
- ali@rumi.team: auth.users row exists, provider=google, last_sign_in=2026-03-08

### Known Observations
- WebFetch of /rumi returns SSR skeleton (no JS) → shows "authenticated: false, hasAccess: false" — this is expected and NOT an error
- The landing page (/) is a full marketing page (not just a redirect shell)
- ali@rumi.team has is_active=true access code → should reach Yellow Orb after auth
