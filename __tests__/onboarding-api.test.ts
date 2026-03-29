import { describe, it, expect } from "vitest"
import { onboardingSchema, toSupabaseRow, fromSupabaseRow } from "../lib/onboarding-api"

describe("onboardingSchema", () => {
  it("validates a complete payload", () => {
    const result = onboardingSchema.safeParse({
      currentStep: 15,
      acquisitionSource: "social_media",
      ageRange: "25-34",
      gender: "male",
      occupation: "employed",
      relationshipStatus: "single",
      supportType: "coaching",
      currentStruggles: ["stress", "burnout"],
      lifeEvents: ["new job"],
      commitmentGoal: 3,
      voicePersonaId: "aria",
      communicationApproach: "balanced",
      radarCalibration: {
        gentleDirect: 0.7,
        emotionalAnalytical: 0.4,
        structuredFlexible: 0.6,
        reservedOpen: 0.8,
        supportiveChallenging: 0.3,
      },
      selectedTheme: "warm-gold",
    })
    expect(result.success).toBe(true)
  })

  it("rejects strings longer than 200 chars", () => {
    const result = onboardingSchema.safeParse({
      currentStep: 1,
      acquisitionSource: "x".repeat(201),
    })
    expect(result.success).toBe(false)
  })

  it("rejects arrays with more than 20 items", () => {
    const result = onboardingSchema.safeParse({
      currentStep: 1,
      currentStruggles: Array(21).fill("item"),
    })
    expect(result.success).toBe(false)
  })

  it("rejects invalid support types", () => {
    const result = onboardingSchema.safeParse({
      currentStep: 1,
      supportType: "invalid_type",
    })
    expect(result.success).toBe(false)
  })

  it("rejects commitment goals outside 1-4", () => {
    const result = onboardingSchema.safeParse({
      currentStep: 1,
      commitmentGoal: 5,
    })
    expect(result.success).toBe(false)
  })

  it("rejects radar values outside 0-1", () => {
    const result = onboardingSchema.safeParse({
      currentStep: 1,
      radarCalibration: {
        gentleDirect: 1.5,
        emotionalAnalytical: 0.5,
        structuredFlexible: 0.5,
        reservedOpen: 0.5,
        supportiveChallenging: 0.5,
      },
    })
    expect(result.success).toBe(false)
  })

  it("provides defaults for missing fields", () => {
    const result = onboardingSchema.safeParse({ currentStep: 1 })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.acquisitionSource).toBe("")
      expect(result.data.currentStruggles).toEqual([])
      expect(result.data.commitmentGoal).toBe(3)
    }
  })
})

describe("toSupabaseRow", () => {
  it("maps store fields to snake_case columns", () => {
    const row = toSupabaseRow(
      {
        currentStep: 10,
        acquisitionSource: "friends_family",
        ageRange: "25-34",
        gender: "female",
        occupation: "student",
        relationshipStatus: "single",
        supportType: "both",
        currentStruggles: ["stress"],
        lifeEvents: ["new job"],
        commitmentGoal: 2,
        voicePersonaId: "james",
        communicationApproach: "supportive",
        radarCalibration: {
          gentleDirect: 0.3,
          emotionalAnalytical: 0.7,
          structuredFlexible: 0.5,
          reservedOpen: 0.5,
          supportiveChallenging: 0.5,
        },
        selectedTheme: "deep-navy",
      },
      "user-123"
    )

    expect(row.user_id).toBe("user-123")
    expect(row.current_step).toBe(10)
    expect(row.acquisition_source).toBe("friends_family")
    expect(row.commitment_weeks).toBe(2)
    expect(row.voice_persona_id).toBe("james")
  })
})

describe("fromSupabaseRow", () => {
  it("maps snake_case columns to camelCase", () => {
    const data = fromSupabaseRow({
      current_step: 15,
      acquisition_source: "search",
      age_range: "35-44",
      gender: "non_binary",
      commitment_weeks: 4,
      current_struggles: ["anxiety", "sleep"],
      radar_calibration: { gentleDirect: 0.9 },
      completed_at: null,
    })

    expect(data.currentStep).toBe(15)
    expect(data.acquisitionSource).toBe("search")
    expect(data.commitmentGoal).toBe(4)
    expect(data.currentStruggles).toEqual(["anxiety", "sleep"])
    expect(data.completedAt).toBeNull()
  })

  it("provides defaults for null/missing values", () => {
    const data = fromSupabaseRow({})
    expect(data.currentStep).toBe(1)
    expect(data.acquisitionSource).toBe("")
    expect(data.currentStruggles).toEqual([])
  })
})
