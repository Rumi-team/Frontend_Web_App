import { create } from "zustand"
import { persist } from "zustand/middleware"

interface UserState {
  xp: number
  streak: number
  wordCount: number
  sessionsCompleted: number
  lastSessionDate: string | null
  focusAreas: string[]
  addXP: (amount: number) => void
  addWordCount: (delta: number) => void
  updateStreak: () => void
  incrementSessionsCompleted: () => void
  hydrate: (data: Partial<UserState>) => void
  setFocusAreas: (areas: string[]) => void
}

let saveTimeout: NodeJS.Timeout | null = null

function debouncedSave(state: UserState) {
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(async () => {
    try {
      await fetch("/api/user/progress", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          xp: state.xp,
          streak: state.streak,
          word_count: state.wordCount,
          sessions_completed: state.sessionsCompleted,
          last_session_date: state.lastSessionDate,
        }),
      })
    } catch {
      // Silently fail — local store is correct, will sync on next save
    }
  }, 1500)
}

function getToday(): string {
  return new Date().toISOString().split("T")[0]
}

function getYesterday(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split("T")[0]
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      xp: 0,
      streak: 0,
      wordCount: 0,
      sessionsCompleted: 0,
      lastSessionDate: null,
      focusAreas: [],

      addXP: (amount: number) => {
        set((state) => ({ xp: state.xp + amount }))
        debouncedSave(get())
      },

      addWordCount: (delta: number) => {
        set((state) => ({ wordCount: state.wordCount + delta }))
        debouncedSave(get())
      },

      updateStreak: () => {
        const state = get()
        const today = getToday()
        const yesterday = getYesterday()

        if (state.lastSessionDate === today) {
          // Already counted today — noop
          return
        }

        if (state.lastSessionDate === yesterday) {
          // Consecutive day — increment
          set({ streak: state.streak + 1, lastSessionDate: today })
        } else {
          // Gap or first session — reset to 1
          set({ streak: 1, lastSessionDate: today })
        }
        debouncedSave(get())
      },

      incrementSessionsCompleted: () => {
        set((state) => ({ sessionsCompleted: state.sessionsCompleted + 1 }))
        debouncedSave(get())
      },

      hydrate: (data: Partial<UserState>) => {
        set(data)
      },

      setFocusAreas: (areas: string[]) => {
        set({ focusAreas: areas })
      },
    }),
    {
      name: "rumi-user-progress",
      partialize: (state) => ({
        xp: state.xp,
        streak: state.streak,
        wordCount: state.wordCount,
        sessionsCompleted: state.sessionsCompleted,
        lastSessionDate: state.lastSessionDate,
        focusAreas: state.focusAreas,
      }),
    }
  )
)
