// Regression: ISSUE-001 — ControlBar text mode button label cycles correctly.
// textMode 0 (voice only): "Transcript" — click to show transcript
// textMode 1 (transcript overlay): "Transcript" — transcript active
// textMode 2 (text input): "Text" — text input active
// Found by /qa on 2026-03-20
// Report: .gstack/qa-reports/qa-report-localhost-2026-03-20.md

import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { ControlBar } from "@/components/coach/control-bar"

// lucide-react icons are not relevant to label behavior; mock to keep tests fast
vi.mock("lucide-react", () => ({
  Mic: () => null,
  MicOff: () => null,
  MessageSquare: () => null,
  PhoneOff: () => null,
}))

const noop = () => {}

describe("ControlBar text-mode button label (regression ISSUE-001)", () => {
  it("shows 'Transcript' when textMode is 0 (voice only — click to show transcript)", () => {
    render(
      <ControlBar
        isMicrophoneEnabled={true}
        textMode={0}
        onToggleMic={noop}
        onCycleTextMode={noop}
        onEndSession={noop}
      />
    )
    expect(screen.getByText("Transcript")).toBeTruthy()
    expect(screen.queryByText("Text")).toBeNull()
  })

  it("shows 'Transcript' when textMode is 1 (transcript overlay active)", () => {
    render(
      <ControlBar
        isMicrophoneEnabled={true}
        textMode={1}
        onToggleMic={noop}
        onCycleTextMode={noop}
        onEndSession={noop}
      />
    )
    expect(screen.getByText("Transcript")).toBeTruthy()
    expect(screen.queryByText("Text")).toBeNull()
  })

  it("shows 'Text' when textMode is 2 (text input active)", () => {
    render(
      <ControlBar
        isMicrophoneEnabled={true}
        textMode={2}
        onToggleMic={noop}
        onCycleTextMode={noop}
        onEndSession={noop}
      />
    )
    expect(screen.getByText("Text")).toBeTruthy()
    expect(screen.queryByText("Transcript")).toBeNull()
  })
})
