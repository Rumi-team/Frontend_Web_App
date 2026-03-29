/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeEach, vi } from "vitest"

// Provide a minimal localStorage stub before importing the store
// (zustand persist needs this at module load time)
const store: Record<string, string> = {}
vi.stubGlobal("localStorage", {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value },
  removeItem: (key: string) => { delete store[key] },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]) },
  get length() { return Object.keys(store).length },
  key: (i: number) => Object.keys(store)[i] ?? null,
})

const { useOnboardingStore } = await import("../store/onboardingStore")

const INITIAL = {
  currentStep: 1,
  acquisitionSource: "",
  ageRange: "",
  gender: "",
  occupation: "",
  relationshipStatus: "",
  supportType: "" as const,
  currentStruggles: [] as string[],
  lifeEvents: [] as string[],
  commitmentGoal: 3 as const,
  voicePersonaId: "",
  communicationApproach: "",
  radarCalibration: {
    gentleDirect: 0.5,
    emotionalAnalytical: 0.5,
    structuredFlexible: 0.5,
    reservedOpen: 0.5,
    supportiveChallenging: 0.5,
  },
  selectedTheme: "",
}

describe("onboardingStore", () => {
  beforeEach(() => {
    useOnboardingStore.setState(INITIAL)
  })

  it("initializes with default values", () => {
    const state = useOnboardingStore.getState()
    expect(state.currentStep).toBe(1)
    expect(state.acquisitionSource).toBe("")
    expect(state.supportType).toBe("")
    expect(state.currentStruggles).toEqual([])
    expect(state.commitmentGoal).toBe(3)
    expect(state.radarCalibration.gentleDirect).toBe(0.5)
  })

  it("nextStep increments currentStep", () => {
    const store = useOnboardingStore.getState()
    store.nextStep()
    expect(useOnboardingStore.getState().currentStep).toBe(2)
    store.nextStep()
    expect(useOnboardingStore.getState().currentStep).toBe(3)
  })

  it("prevStep decrements but never below 1", () => {
    const store = useOnboardingStore.getState()
    store.prevStep()
    expect(useOnboardingStore.getState().currentStep).toBe(1) // Can't go below 1
    store.setStep(5)
    store.prevStep()
    expect(useOnboardingStore.getState().currentStep).toBe(4)
  })

  it("setField updates individual fields", () => {
    const store = useOnboardingStore.getState()
    store.setField("acquisitionSource", "social_media")
    expect(useOnboardingStore.getState().acquisitionSource).toBe("social_media")

    store.setField("currentStruggles", ["stress", "anxiety"])
    expect(useOnboardingStore.getState().currentStruggles).toEqual(["stress", "anxiety"])

    store.setField("supportType", "coaching")
    expect(useOnboardingStore.getState().supportType).toBe("coaching")
  })

  it("setField updates radar calibration", () => {
    const store = useOnboardingStore.getState()
    store.setField("radarCalibration", {
      gentleDirect: 0.8,
      emotionalAnalytical: 0.3,
      structuredFlexible: 0.6,
      reservedOpen: 0.9,
      supportiveChallenging: 0.2,
    })
    const cal = useOnboardingStore.getState().radarCalibration
    expect(cal.gentleDirect).toBe(0.8)
    expect(cal.supportiveChallenging).toBe(0.2)
  })

  it("reset restores all defaults", () => {
    const store = useOnboardingStore.getState()
    store.setStep(15)
    store.setField("acquisitionSource", "therapist")
    store.setField("currentStruggles", ["burnout"])
    store.setField("commitmentGoal", 4)

    store.reset()
    const state = useOnboardingStore.getState()
    expect(state.currentStep).toBe(1)
    expect(state.acquisitionSource).toBe("")
    expect(state.currentStruggles).toEqual([])
    expect(state.commitmentGoal).toBe(3)
  })

  it("setStep jumps to a specific step", () => {
    const store = useOnboardingStore.getState()
    store.setStep(12)
    expect(useOnboardingStore.getState().currentStep).toBe(12)
  })
})
