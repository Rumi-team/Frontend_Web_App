# Ship Checklist — fix/pkce-double-exchange
Created: 2026-03-19
Status: **READY TO SHIP** — just run `/ship`

---

## Branch Summary

**Branch:** `fix/pkce-double-exchange`
**Base:** `main`
**Repo:** Frontend_Web_App (Next.js, pnpm)

### 3 commits on this branch:
1. `157691d` — adding email of users to App profile
2. `74b0514` — feat: show mascot in free conversation mode + transcript replaces center area
3. `b9ca1c5` — feat: overlay visualizers on mascot + always show SessionOrb when steps exist

### What changed (5 files, +83 −50):
- **`components/auth-provider.tsx`** — PKCE double-exchange guard: `codeExchangeDone` ref prevents duplicate OAuth code exchange on back navigation or React Strict Mode double-render
- **`components/coach/coaching-session.tsx`** — Layout restructure: visualizers overlaid at bottom of mascot (not stacked below), standalone `RumiMascot` shown in free conversation mode, `SessionOrb` always shown when `currentStep !== null` (no longer requires `selectedProgram`)
- **`components/coach/start-view.tsx`** — `NameEditDialog` shows user email; Apple auth shows "Logged in with your Apple ID" instead
- **`app/(coach)/rumi/page.tsx`** — Threads `userEmail` and `authProvider` down to `StartView`
- **`.gitignore`** — minor update

---

## Review Status (already done)

| Review | Status | Commit |
|--------|--------|--------|
| Eng Review (`/plan-eng-review`) | ✅ CLEAN | b9ca1c5 |
| Design Review (`/plan-design-review`) | ✅ CLEAN (8/10) | e0eae0e |
| CEO Review | — not needed | — |
| Codex Review | — not needed | — |

**Verdict: CLEARED** — eng review passed, all at HEAD.

---

## QA Status (already done)

- QA run: 2026-03-19, headless browser on `localhost:3000`
- Health score: **87/100**
- Branch-introduced bugs: **0**
- Pre-existing issue found: Missing PWA assets (favicon, manifest, icons) — Low severity, deferred
- Auth-required flows (mascot layout, email display) verified by code review only
- Full report: `.gstack/qa-reports/qa-report-localhost-2026-03-19.md`

---

## To Ship

```bash
cd ~/dev/rumi-workspace/Frontend_Web_App
/ship
```

`/ship` will:
1. Merge `main` into this branch
2. Run tests (vitest — no tests yet, will prompt to bootstrap or skip)
3. Pre-landing review of the diff
4. Auto-bump version (MICRO — <50 lines changed per file)
5. Update CHANGELOG
6. Commit + push
7. Create PR against `main`

### Expected blockers in /ship:
- **No test framework** — `/ship` will offer to bootstrap Vitest. The eng review recommended bootstrapping Vitest with 14 test cases. You can accept or skip for now.
- **Merge conflicts unlikely** — branch is recent, main hasn't changed much.

---

## Post-Ship Actions (separate tasks)

### 1. Set CRON_SECRET in Vercel (P1 — do ASAP)
Cron endpoints (`/api/cron/reminders`, `/api/cron/decide`, `/api/cron/reward-eval`) are unprotected in production.
```bash
cd ~/dev/rumi-workspace/Frontend_Web_App
# Generate a secret
openssl rand -hex 32
# Add to Vercel
vercel env add CRON_SECRET production
# Add to local
echo "CRON_SECRET=<generated>" >> .env.local
```

### 2. Implement connection speed optimizations (separate branch: `chore/plan-review-cleanup`)
The full plan was reviewed and approved. Implementation pending. Key changes:
- `lib/cron-auth.ts` — shared cron auth helper
- `lib/types/livekit.ts` — add `waiting_for_agent` to ConnectionState
- `app/api/token/route.ts` — dispatch-on-connect via RoomConfiguration (drops createRoom+createDispatch)
- `hooks/use-livekit-connection.ts` — add `connectWithToken()`, 15s agent-arrival timeout + auto-retry
- `app/(coach)/rumi/page.tsx` — parallel mic+token fetch, MascotTransition rendering
- New: `components/coach/mascot-transition.tsx` — CSS emotional map, morph to SessionOrb
- Vitest setup with 14 test cases

### 3. Upgrade LiveKit plan (P1 — user action required)
1,413/1,000 free Build plan minutes used. Agent connections failing due to quota.
- Go to LiveKit Cloud dashboard → Billing → Upgrade to **Ship plan ($50/mo)**
- No code change needed.

---

## Context for Next Session

- Working dir: `/Users/mlscientist/dev/rumi-workspace/Frontend_Web_App`
- Next.js 15, pnpm, Vercel deploy
- Supabase project: `xdaxseboeioleiguqfkg` (us-east-2)
- Vercel project: `rumis-projects-6f8665a7/web-front-end`
- Production: `www.rumi.team` (deploy via GitHub push to `main`, not `vercel deploy --prod`)
- Test plan artifact: `~/.gstack/projects/Rumi-team-Frontend_Web_App/mlscientist-chore-plan-review-cleanup-test-plan-20260319.md`
- Full workspace TODOS: `~/dev/rumi-workspace/TODOS_Rumi_App.md`
