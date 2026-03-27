# Changelog

All notable changes to the Frontend Web App are documented here.

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
