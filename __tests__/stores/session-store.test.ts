import { describe, it, expect, beforeEach } from "vitest"
import { useSessionStore } from "@/store/sessionStore"

describe("sessionStore", () => {
  beforeEach(() => {
    useSessionStore.setState({
      isSessionActive: false,
      isPaused: false,
      timeRemaining: 300,
      transcript: [],
      messageViewMode: "subtitles",
    })
  })

  it("starts with default values", () => {
    const state = useSessionStore.getState()
    expect(state.isSessionActive).toBe(false)
    expect(state.isPaused).toBe(false)
    expect(state.timeRemaining).toBe(300)
    expect(state.transcript).toEqual([])
  })

  it("startSession sets active and resets state", () => {
    useSessionStore.getState().startSession()
    const state = useSessionStore.getState()
    expect(state.isSessionActive).toBe(true)
    expect(state.isPaused).toBe(false)
    expect(state.timeRemaining).toBe(300)
    expect(state.transcript).toEqual([])
  })

  it("endSession clears all session state", () => {
    useSessionStore.getState().startSession()
    useSessionStore.getState().appendTranscript("hello")
    useSessionStore.getState().endSession()
    const state = useSessionStore.getState()
    expect(state.isSessionActive).toBe(false)
    expect(state.transcript).toEqual([])
  })

  it("pauseSession sets isPaused", () => {
    useSessionStore.getState().startSession()
    useSessionStore.getState().pauseSession()
    expect(useSessionStore.getState().isPaused).toBe(true)
  })

  it("resumeSession clears isPaused", () => {
    useSessionStore.getState().startSession()
    useSessionStore.getState().pauseSession()
    useSessionStore.getState().resumeSession()
    expect(useSessionStore.getState().isPaused).toBe(false)
  })

  it("tickTimer decrements by 1", () => {
    useSessionStore.getState().tickTimer()
    expect(useSessionStore.getState().timeRemaining).toBe(299)
  })

  it("tickTimer does not go below 0", () => {
    useSessionStore.setState({ timeRemaining: 0 })
    useSessionStore.getState().tickTimer()
    expect(useSessionStore.getState().timeRemaining).toBe(0)
  })

  it("appendTranscript adds to array", () => {
    useSessionStore.getState().appendTranscript("hello")
    useSessionStore.getState().appendTranscript("world")
    expect(useSessionStore.getState().transcript).toEqual(["hello", "world"])
  })
})
