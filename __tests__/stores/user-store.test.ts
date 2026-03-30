/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeEach, vi } from "vitest"

const store: Record<string, string> = {}
vi.stubGlobal("localStorage", {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value },
  removeItem: (key: string) => { delete store[key] },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]) },
  get length() { return Object.keys(store).length },
  key: (i: number) => Object.keys(store)[i] ?? null,
})
vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ ok: true })))

const { useUserStore } = await import("../../store/userStore")

describe("userStore", () => {
  beforeEach(() => {
    useUserStore.setState({
      xp: 0,
      streak: 0,
      wordCount: 0,
      sessionsCompleted: 0,
      lastSessionDate: null,
      focusAreas: [],
    })
  })

  it("addXP increments xp", () => {
    useUserStore.getState().addXP(50)
    expect(useUserStore.getState().xp).toBe(50)
  })

  it("addXP accumulates", () => {
    useUserStore.getState().addXP(20)
    useUserStore.getState().addXP(30)
    expect(useUserStore.getState().xp).toBe(50)
  })

  it("addWordCount increments word count", () => {
    useUserStore.getState().addWordCount(100)
    expect(useUserStore.getState().wordCount).toBe(100)
  })

  it("incrementSessionsCompleted increments count", () => {
    useUserStore.getState().incrementSessionsCompleted()
    useUserStore.getState().incrementSessionsCompleted()
    expect(useUserStore.getState().sessionsCompleted).toBe(2)
  })

  describe("updateStreak", () => {
    it("sets streak to 1 when lastSessionDate is null", () => {
      useUserStore.getState().updateStreak()
      const state = useUserStore.getState()
      expect(state.streak).toBe(1)
      expect(state.lastSessionDate).toBe(new Date().toISOString().split("T")[0])
    })

    it("does nothing when lastSessionDate is today", () => {
      const today = new Date().toISOString().split("T")[0]
      useUserStore.setState({ streak: 5, lastSessionDate: today })
      useUserStore.getState().updateStreak()
      expect(useUserStore.getState().streak).toBe(5)
    })

    it("increments streak when lastSessionDate is yesterday", () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split("T")[0]
      useUserStore.setState({ streak: 3, lastSessionDate: yesterdayStr })
      useUserStore.getState().updateStreak()
      expect(useUserStore.getState().streak).toBe(4)
    })

    it("resets streak to 1 when lastSessionDate is older than yesterday", () => {
      const oldDate = new Date()
      oldDate.setDate(oldDate.getDate() - 5)
      const oldDateStr = oldDate.toISOString().split("T")[0]
      useUserStore.setState({ streak: 10, lastSessionDate: oldDateStr })
      useUserStore.getState().updateStreak()
      expect(useUserStore.getState().streak).toBe(1)
    })
  })

  it("hydrate overwrites fields", () => {
    useUserStore.getState().hydrate({ xp: 500, streak: 7 })
    expect(useUserStore.getState().xp).toBe(500)
    expect(useUserStore.getState().streak).toBe(7)
  })

  it("setFocusAreas sets the array", () => {
    useUserStore.getState().setFocusAreas(["stress", "relationships"])
    expect(useUserStore.getState().focusAreas).toEqual(["stress", "relationships"])
  })
})
