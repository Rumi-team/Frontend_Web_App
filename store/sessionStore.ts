import { create } from "zustand"

interface SessionState {
  isSessionActive: boolean
  isPaused: boolean
  timeRemaining: number
  transcript: string[]
  messageViewMode: "subtitles" | "chat_history" | "none"
  startSession: () => void
  endSession: () => void
  pauseSession: () => void
  resumeSession: () => void
  tickTimer: () => void
  appendTranscript: (text: string) => void
}

export const useSessionStore = create<SessionState>((set) => ({
  isSessionActive: false,
  isPaused: false,
  timeRemaining: 300,
  transcript: [],
  messageViewMode: "subtitles",

  startSession: () =>
    set({ isSessionActive: true, isPaused: false, timeRemaining: 300, transcript: [] }),

  endSession: () =>
    set({ isSessionActive: false, isPaused: false, timeRemaining: 300, transcript: [] }),

  pauseSession: () =>
    set({ isPaused: true }),

  resumeSession: () =>
    set({ isPaused: false }),

  tickTimer: () =>
    set((state) => ({ timeRemaining: Math.max(0, state.timeRemaining - 1) })),

  appendTranscript: (text: string) =>
    set((state) => ({ transcript: [...state.transcript, text] })),
}))
