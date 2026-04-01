# Changelog

All notable changes to the Frontend Web App are documented here.

## [0.2.1.1] - 2026-04-01 — QA Bug Fixes

### Fixed
- **Path tab loading spinner resolved.** Infinite re-render loop in `useTimelineData` caused by Zustand selector reference instability. Fixed with useRef pattern.
- **Phone tab avatar fallback.** When no voice persona selected or avatar 404s, now shows Rumi mascot instead of empty circle.

## [0.2.1.0] - 2026-04-01 — iOS Parity + Duolingo Path

The web app now matches the iOS app. 5-tab navigation, iOS-style Settings and You pages, and a Duolingo-style zigzag practice path that makes daily coaching feel like a game.

### Added
- **5-tab bottom navigation** matching iOS: Phone, Chat, Path, You, Settings. Light/dark theme with pill-shaped active indicator.
- **Chat tab** in bottom nav. Moved from (coach) to (main) route group for direct access.
- **Duolingo-style zigzag path** with alternating node positions, star/chest/trophy node types, amber section banner ("Today's Path"), and "UP NEXT" separator for tomorrow.
- **iOS-style You/Profile page**: large avatar with + button, Lv.1 level badge with tier name (Quiet Seed), XP progress bar with "N more to [Next Tier]", 3-stat row (Streak, Words, Saved), About You card, Focus Areas card.
- **Privacy & Security section** in Settings with App Lock toggle.
- **9 gender-matched avatar portraits** generated via gemini-3-pro-image-preview (Headspace/Calm illustration style).
- **9 Gemini voice preview MP3s** via gemini-2.5-flash-preview-tts.

### Changed
- **Settings section order** now matches iOS: App Feedback > Safety > Personalization > Privacy > Appearance > Account.
- **Settings icons moved to right side** (iOS pattern: text left, icon + chevron right).
- **Voice roster updated** to 9 voices: Gacrux (default), Fenrir, Leda, Aoede, Enceladus, Erinome, Algenib, Achernar, Sulafat.
- **Toggle color** changed from blue to green (iOS style).

## [0.2.0.0] - 2026-04-01 — Settings Production-Ready

All Settings buttons are now functional. Your voice coach has a face. Dark mode works everywhere. Waitlist users get a real email. Streak celebrations pop with Lottie animations. The Settings page went from "prototype" to "product."

### Added
- **Delete Account:** Two-step confirmation modal with "type DELETE" safety. Supabase RPC cascade deletes all user data in a single transaction before auth removal. Redirects to a dedicated /account-deleted page.
- **Waitlist welcome email:** "Join the Waitlist" on the Human Coach modal now sends Ali's full program email via Resend with hybrid coaching details, pricing, and 6 intake questions. Rate-limited with `email_sent` tracking to prevent duplicates.
- **8 Gemini voice personas in Settings:** CustomizeAIModal upgraded from 4 placeholder voices to the real Gemini Live voices (Puck, Charon, Kore, Fenrir, Aoede, Leda, Orus, Zephyr) with coaching-style avatar slots and audio preview buttons.
- **Real background image picker:** AppearanceModal now shows actual JPG photo thumbnails via next/image instead of solid color squares.
- **Lottie streak celebrations:** celebration-effects.tsx upgraded with Lottie animation support (confetti, stars, flame), 5s cooldown between celebrations, max 3 per session, and `prefers-reduced-motion` handling.
- **Account deleted page** at `/account-deleted` with clean post-deletion UX.
- **4 new test suites:** delete-account API (auth, cascade rollback, idempotency), settings-patch (column whitelist, body injection prevention), waitlist-email (rate limiting, duplicate prevention), settings-debounce (coalescing, cancel before delete).

### Changed
- **Settings section order:** Personalization > Appearance > Safety > Feedback > Account (was Feedback first).
- **App-wide dark mode:** All 7 settings modals, SettingsList, SectionHeader, SettingsRow now use `dark:` classes. Toggles have `role="switch"` and `aria-checked` for accessibility.
- **Feedback consolidated:** FeedbackModal now writes to `user_feedback` (with `feedback_type: "general"`) instead of the separate `feedback` table. The `feedback` table has been dropped.
- **voice_persona_id in LiveKit metadata:** Token route now passes selected voice to backend for per-user TTS.

### Fixed
- **Settings PATCH security:** Body spread vulnerability fixed with column whitelist. Unknown keys (including `user_id`) are stripped before upsert.
- **FeedbackModal import:** Fixed `createBrowserClient` → `createSupabaseBrowserClient`.
- **Delete Account button:** Was non-functional (no onClick handler). Now opens confirmation modal.

### Migrations Applied
- `delete_user_cascade` — RPC function for transactional account deletion
- `waitlist_email_tracking` — `email_sent` + `email_sent_at` columns on website_waitlist
- `consolidate_feedback` — `feedback_type`, `user_id`, `content` columns on user_feedback; dropped `feedback` table

## [0.1.4.0] - 2026-03-29

### Added
- **8 real Gemini Live voices:** Voice selection grid now shows Puck, Charon, Kore, Fenrir, Aoede, Leda, Orus, Zephyr with personality descriptions. Selected voice ID passes directly to Gemini API.
- **Back navigation on all onboarding screens:** ChevronLeft button on every screen (except the first post-auth step). Users can go back to change answers.
- **Strong personality directives:** Communication style and radar calibration now generate explicit behavioral instructions in the coaching prompt (e.g., "BE DIRECT", "CHALLENGE MODE") instead of soft context.
- **Per-user voice in backend:** agent.py loads the user's chosen Gemini voice from `user_onboarding.voice_persona_id` and uses it for the session instead of the env var default.

### Changed
- **Themes:** Replaced generic color themes with 4 black/gold variants matching Rumi brand (Obsidian Gold, Midnight Amber, Charcoal Honey, Pure Black).
- **Landing page:** Outcome-first copy redesign with Server Component architecture.

## [0.1.3.0] - 2026-03-29

### Added
- **Full onboarding flow (28 screens):** 25-screen wizard + 3 post-session screens adapted from Sonia spec for Rumi. Collects user context, goals, AI personality calibration, and communication preferences before the first coaching session.
- **Pre-auth flow (`/welcome`):** Welcome, Mission, Acquisition survey, then OAuth. Auth happens after users see value, framed as "save your progress."
- **Post-auth wizard (`/onboarding`):** Surveys (combined demographics, struggles, life events), social proof, goal setting, privacy assurance, AI calibration radar chart, voice persona selection, theme picker, setup completion with confetti.
- **Post-first-session flow:** Plan generation loading, personalized plan summary, day-1 streak dashboard. Triggered after first coaching session completes.
- **Zustand store** (`store/onboardingStore.ts`) with localStorage persist and debounced Supabase save for cross-device resume.
- **Resume interstitial:** Returning users see "Welcome back, continue where you left off" with progress indicator.
- **9 shared components:** WizardLayout, SurveyRadio, SurveyMultiSelect, FABArrow, ProgressiveChecklist, OnboardingButton, StepProgress, ResumeInterstitial, ErrorRetry.
- **API routes:** `GET/POST /api/onboarding` (Zod-validated save/load), `POST /api/onboarding/complete` (sets completion cookie).
- **Supabase migration:** `user_onboarding` table with separate INSERT/SELECT/UPDATE RLS policies (no DELETE).
- **Middleware onboarding gate:** Cookie-based check (zero extra DB queries per request), `E2E_BYPASS_ONBOARDING` env var.
- **16 new tests** for Zustand store and Zod validation schemas.

### Changed
- **Journey Path improvements:** Rich step detail sheets for locked and completed steps. Teaching mode toggle passes metadata to backend.

## [0.1.2.1] - 2026-03-28

### Fixed
- **Short session feedback gate:** Sessions under 30 seconds no longer trigger the NPS feedback overlay. Users who briefly connect and disconnect are not asked to rate.
- **Smooth screen transitions:** JourneyPath and coaching session now crossfade with opacity + scale animations (700ms ease-in-out) instead of hard-cutting between views. "Connecting to Rumi..." intermediate state with pulsing mascot.

### Changed
- **Duolingo-style roadmap redesign:** Centered zigzag S-curve layout, tap-to-start (removed hold gesture), "START" callout badge on current step, pulsing ring with glow, compact 72px node spacing, dotted connecting lines, selective labels on completed + current steps only.

## [0.1.2.0] - 2026-03-27

### Added
- **Listening Coach (Phase 1):** SessionOrb now accepts `sessionPhase` prop, shows "Listening..." indicator during free-form opening, and includes `aria-label` for screen reader accessibility
- **Visual Teacher (Phase 2):** New `TeachingCard` component for full-screen concept image takeover during teaching phases. `use-session-control.ts` handles `concept_image` and `teaching_complete` data messages with crossfade transitions
- **Journey Path (Phase 3):** Duolingo-style roadmap replaces StartView as the home screen. Includes `JourneyPath`, `StepNode`, `SectionBanner`, and `StepSummarySheet` components with hold-to-start interaction, completed/current/locked states, and dark/gold aesthetic
- New `/api/progress` route reads user step progress from Supabase (resolves `provider_user_id` via `user_identities` table, handles double-encoded JSON)
- New `useStepProgress` hook for client-side progress data fetching
- Fallback UI when `/api/progress` fails: "Start Session" button + retry link (users never stuck on spinner)
- Keyboard Enter/Space activation for hold-to-start step node (accessibility)

### Changed
- `rumi/page.tsx`: JourneyPath replaces StartView in disconnected state, bottom nav preserved
- `coaching-session.tsx`: passes `sessionPhase` to SessionOrb, renders TeachingCard overlay during teaching

## [0.1.1.2] - 2026-03-26

### Fixed
- Feedback overlay: responsive layout improvements for mobile, comment step always shown regardless of NPS score
- Favicon and OG logo: removed alpha transparency causing rendering issues on some platforms
- Vertex REST API: use camelCase (`inlineData`, `mimeType`) for PDF upload request body
- Orb keyboard handler: guard against key auto-repeat preventing hold timer restart on each repeat event
- Sheet Escape handler: moved from non-focusable backdrop to dialog container so keyboard events actually fire

### Style / Accessibility
- Main CTA: orb container now keyboard-accessible with `role="button"`, `tabIndex`, and Enter/Space handlers
- Main CTA: "Tap & Hold to Start Your Transformation" text upgraded from `<p>` to `<h1>` for proper heading hierarchy
- Library sheet, assignments sheet, feedback overlay: added `role="dialog"`, `aria-modal="true"`, and descriptive `aria-label`
- Icon-only buttons: added `aria-label` to close buttons, password toggle, sign-out, and music toggle
- Replaced `transition-all` with specific property transitions across coach-shell, start-view, and feedback-overlay to reduce unnecessary repaints

### Tests
- Added keyboard accessibility tests: Escape key on sheet dialogs, ARIA attributes on sheets
- Updated regression tests: control-bar label and feedback overlay flow tests aligned with current behavior
- Total: 22 tests, 5 test files, all passing

## [0.1.1.0] - 2026-03-20

### Added
- E2E dev-only bypasses for auth (Supabase), mic permission, and LiveKit — guarded by `NODE_ENV === "development"` and double-checked against `NEXT_PUBLIC_E2E_TESTING`; never activates in production
- NPS feedback overlay: 3-step survey flow (overall rating → NPS 0-10 → optional comment), with auto-submit fast path for promoters (NPS ≥ 9 + rating ≥ 4)
- Supabase migration: `nps_score` (0–10) and `nps_category` (promoter/passive/detractor) columns on `user_feedback` table with `IF NOT EXISTS` guard
- Session orb (`SessionOrb`) always visible when step data is available; visualizers overlaid on mascot via `pointer-events-none` wrapper
- PKCE double-exchange guard in auth provider to prevent token reuse on fast OAuth redirects

### Fixed
- Orb press reliability: same-tick `mousedown`+`mouseup` (e.g. Playwright synthetic click) could silently drop a session start due to a `requestAnimationFrame` timing race — fixed with an early-return bypass when `HOLD_DURATION <= 0`
- ControlBar text-mode label: was always `"Text"`; now shows `"Transcript"` when `textMode === 1` and `"Text"` otherwise
- Equalizer bars overlapping mascot/orb on small viewports — visualizers moved to a separate `pointer-events-none` container below the mascot
- NaN `strokeDashoffset` on session orb when step data was `null` before first load — guarded with `|| 0`
- Music was playing on session start by default — changed to off by default (`autoPlay` removed)
- `isE2ETesting` re-evaluated on every render in `CoachShell` and `useMicrophonePermission` — hoisted to module level for stable reference
- PKCE OAuth code exchanged twice when landing at `/rumi` with a `?code=` query param — now guarded against double exchange

### Style / Accessibility
- Landing page: replaced 12-card feature grid with 3 grouped feature categories to reduce visual noise
- Added `focus-visible` ring to interactive elements and `prefers-reduced-motion` support for animations
- Increased footer touch targets to 44 px minimum; fixed Sign In link touch target size
- Added ARIA landmarks and labels to landing page sections for screen reader compatibility
- Removed `user-scalable=no` viewport restriction that blocked accessibility zoom
- `RevealSection` transition now uses explicit properties instead of `transition: all`
- Added hover underline to Contact Support button for affordance clarity

### Tests
- Regression tests: `test/control-bar.regression-1.test.tsx` (3 cases) — ControlBar text-mode label (ISSUE-001)
- Regression tests: `test/feedback-overlay.regression-1.test.tsx` (4 cases) — FeedbackOverlay NPS step flow (ISSUE-004)
- Total: 18 tests, 4 test files, all passing

## [0.1.0.1] - 2026-03-19

### Added
- Vitest test framework with @testing-library/react and jsdom
- 11 unit tests covering auth provider (PKCE double-exchange guard, provider identity resolution) and name edit dialog (email display logic)
- GitHub Actions CI workflow for automated test runs on push/PR
- TESTING.md with testing conventions and guidelines
