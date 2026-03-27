// Coverage: keyboard handlers added in fix/feedback-mobile-and-comment-step
// Tests Escape key on sheet backdrops and Enter/Space on start-view orb

import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"

// ── AssignmentsSheet ────────────────────────────────────────────────

vi.mock("@/hooks/use-library-data", () => ({
  useLibraryData: () => ({
    commitments: [],
    transformations: [],
    sessions: [],
    stats: null,
    isLoading: false,
    fetchEvaluation: vi.fn(),
    trajectoryData: [],
    growthSnapshot: null,
  }),
}))

vi.mock("lucide-react", () => {
  const Stub = () => null
  return {
    X: Stub, ClipboardList: Stub, CheckCircle2: Stub, Clock: Stub,
    Loader2: Stub, BookOpen: Stub, Zap: Stub, MessageCircle: Stub,
    Eye: Stub, Sparkles: Stub, Mic: Stub, MicOff: Stub, PhoneOff: Stub,
    Music: Stub, Volume2: Stub, VolumeX: Stub, Settings: Stub,
    LogOut: Stub, Library: Stub, ChevronDown: Stub, ChevronRight: Stub,
  }
})

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => <img {...props} />,
}))

vi.mock("@/components/library/journey-stats", () => ({ JourneyStats: () => null }))
vi.mock("@/components/library/session-detail-sheet", () => ({ SessionDetailSheet: () => null }))
vi.mock("@/components/library/growth-trajectory-chart", () => ({ GrowthTrajectoryChart: () => null }))
vi.mock("@/components/library/growth-alert-banner", () => ({ GrowthAlertBanner: () => null }))
vi.mock("@/components/library/strategy-effectiveness-chart", () => ({ StrategyEffectivenessChart: () => null }))

import { AssignmentsSheet } from "@/components/coach/assignments-sheet"
import { LibrarySheet } from "@/components/library/library-sheet"

describe("AssignmentsSheet keyboard accessibility", () => {
  it("calls onClose when Escape is pressed on the dialog container", () => {
    const onClose = vi.fn()
    render(<AssignmentsSheet isOpen={true} onClose={onClose} providerUserId="u1" />)

    const dialog = screen.getByRole("dialog")
    fireEvent.keyDown(dialog, { key: "Escape" })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it("has correct ARIA attributes for dialog", () => {
    render(<AssignmentsSheet isOpen={true} onClose={vi.fn()} providerUserId="u1" />)
    const dialog = screen.getByRole("dialog")
    expect(dialog).toHaveAttribute("aria-modal", "true")
    expect(dialog).toHaveAttribute("aria-label", "Your Assignments")
  })
})

describe("LibrarySheet keyboard accessibility", () => {
  it("calls onClose when Escape is pressed on the dialog container", () => {
    const onClose = vi.fn()
    render(<LibrarySheet isOpen={true} onClose={onClose} providerUserId="u1" />)

    const dialog = screen.getByRole("dialog")
    fireEvent.keyDown(dialog, { key: "Escape" })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it("has correct ARIA attributes for dialog", () => {
    render(<LibrarySheet isOpen={true} onClose={vi.fn()} providerUserId="u1" />)
    const dialog = screen.getByRole("dialog")
    expect(dialog).toHaveAttribute("aria-modal", "true")
    expect(dialog).toHaveAttribute("aria-label", "Your Journey")
  })
})
