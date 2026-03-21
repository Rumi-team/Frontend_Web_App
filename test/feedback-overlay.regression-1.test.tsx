// Regression: ISSUE-004 — FeedbackOverlay NPS step flow and npsCategory logic
// Ensures rating click advances to NPS step, high NPS + high rating auto-submits,
// low NPS advances to comment step.
// Found by /qa on 2026-03-20
// Report: .gstack/qa-reports/qa-report-localhost-2026-03-20.md

import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, act, fireEvent } from "@testing-library/react"
import { FeedbackOverlay } from "@/components/coach/feedback-overlay"

const mockInsert = vi.fn().mockResolvedValue({ error: null })
vi.mock("@/lib/supabase-auth-browser", () => ({
  createSupabaseBrowserClient: () => ({
    from: () => ({ insert: mockInsert }),
  }),
}))

vi.mock("@/components/auth-provider", () => ({
  useAuth: () => ({ providerUserId: "test-user-123" }),
}))

// requestAnimationFrame is not available in jsdom — stub it
globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => {
  cb(0)
  return 0
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers()
})

describe("FeedbackOverlay NPS step flow (regression ISSUE-004)", () => {
  it("shows rating step on mount", () => {
    render(<FeedbackOverlay sessionId="sess-1" onComplete={vi.fn()} />)
    expect(screen.getByText("How was your session?")).toBeTruthy()
    expect(screen.getByText("Poor")).toBeTruthy()
    expect(screen.getByText("Great")).toBeTruthy()
  })

  it("advances to NPS step after clicking a rating", async () => {
    render(<FeedbackOverlay sessionId="sess-1" onComplete={vi.fn()} />)
    const goodBtn = screen.getByText("Good").closest("button")!
    fireEvent.click(goodBtn)
    // handleRating sets step to "nps" after 300ms timeout
    await act(async () => { vi.advanceTimersByTime(400) })
    expect(screen.getByText("Would you tell a friend about Rumi?")).toBeTruthy()
  })

  it("auto-submits when NPS >= 9 and rating >= 4 (promoter fast path)", async () => {
    const onComplete = vi.fn()
    render(<FeedbackOverlay sessionId="sess-2" onComplete={onComplete} />)

    // Click rating 4 ("Good")
    fireEvent.click(screen.getByText("Good").closest("button")!)
    await act(async () => { vi.advanceTimersByTime(400) })

    // Click NPS 9
    const npsBtn = screen.getByText("9")
    fireEvent.click(npsBtn)
    await act(async () => { vi.advanceTimersByTime(100) })

    // Should have called insert (auto-submit triggered)
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        session_id: "sess-2",
        overall_rating: 4,
        nps_score: 9,
        nps_category: "promoter",
      })
    )
  })

  it("advances to comment step when NPS <= 8 after rating", async () => {
    render(<FeedbackOverlay sessionId="sess-3" onComplete={vi.fn()} />)

    // Click rating 3 ("OK")
    fireEvent.click(screen.getByText("OK").closest("button")!)
    await act(async () => { vi.advanceTimersByTime(400) })

    // Click NPS 5
    fireEvent.click(screen.getByText("5"))
    await act(async () => { vi.advanceTimersByTime(400) })

    // Should now show comment step
    expect(screen.getByText("What could be better?")).toBeTruthy()
  })
})
