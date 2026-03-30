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

const { useSettingsStore } = await import("../../store/settingsStore")

describe("settingsStore", () => {
  beforeEach(() => {
    useSettingsStore.setState({
      selectedVoice: "",
      aiStyle: "",
      radarCalibration: {},
      customInstructions: "",
      selectedTheme: "forest_light",
      lightDark: "dark",
      appLock: false,
      backgroundMusic: false,
      particles: true,
      edgeGlow: true,
      homeScreenQuote: true,
      streakCelebration: true,
      hapticFeedback: true,
      showAvatar: true,
      activeQuests: ["daily_affirmation", "morning_intention", "evening_reflection"],
      _hydrated: false,
    })
  })

  it("setField updates a field", () => {
    useSettingsStore.getState().setField("selectedTheme", "mountain_lake")
    expect(useSettingsStore.getState().selectedTheme).toBe("mountain_lake")
  })

  it("setField updates lightDark", () => {
    useSettingsStore.getState().setField("lightDark", "light")
    expect(useSettingsStore.getState().lightDark).toBe("light")
  })

  it("toggleQuest adds a quest", () => {
    useSettingsStore.getState().toggleQuest("weekly_review")
    expect(useSettingsStore.getState().activeQuests).toContain("weekly_review")
  })

  it("toggleQuest removes an existing quest", () => {
    useSettingsStore.getState().toggleQuest("daily_affirmation")
    expect(useSettingsStore.getState().activeQuests).not.toContain("daily_affirmation")
  })

  it("toggleQuest is idempotent on add-remove cycle", () => {
    useSettingsStore.getState().toggleQuest("weekly_review")
    useSettingsStore.getState().toggleQuest("weekly_review")
    expect(useSettingsStore.getState().activeQuests).not.toContain("weekly_review")
  })

  it("hydrateFromOnboarding copies fields and sets _hydrated", () => {
    useSettingsStore.getState().hydrateFromOnboarding({
      voicePersonaId: "sonia",
      communicationApproach: "gentle",
      radarCalibration: { gentleDirect: 0.3, emotionalAnalytical: 0.7 },
      selectedTheme: "sunset_sky",
    })
    const state = useSettingsStore.getState()
    expect(state.selectedVoice).toBe("sonia")
    expect(state.aiStyle).toBe("gentle")
    expect(state.radarCalibration.gentleDirect).toBe(0.3)
    expect(state.selectedTheme).toBe("sunset_sky")
    expect(state._hydrated).toBe(true)
  })

  it("hydrate overwrites arbitrary fields", () => {
    useSettingsStore.getState().hydrate({ particles: false, edgeGlow: false })
    expect(useSettingsStore.getState().particles).toBe(false)
    expect(useSettingsStore.getState().edgeGlow).toBe(false)
  })

  it("starts with 3 default active quests", () => {
    expect(useSettingsStore.getState().activeQuests).toHaveLength(3)
    expect(useSettingsStore.getState().activeQuests).toContain("daily_affirmation")
  })
})
