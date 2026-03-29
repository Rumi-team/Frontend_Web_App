import { z } from "zod"

export const onboardingSchema = z.object({
  currentStep: z.number().int().min(1).max(30),
  acquisitionSource: z.string().max(200).default(""),
  ageRange: z.string().max(50).default(""),
  gender: z.string().max(100).default(""),
  occupation: z.string().max(200).default(""),
  relationshipStatus: z.string().max(100).default(""),
  supportType: z.enum(["emotional", "coaching", "both", "unsure", ""]).default(""),
  currentStruggles: z.array(z.string().max(200)).max(20).default([]),
  lifeEvents: z.array(z.string().max(200)).max(20).default([]),
  commitmentGoal: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).default(3),
  voicePersonaId: z.string().max(100).default(""),
  communicationApproach: z.string().max(100).default(""),
  radarCalibration: z.object({
    gentleDirect: z.number().min(0).max(1),
    emotionalAnalytical: z.number().min(0).max(1),
    structuredFlexible: z.number().min(0).max(1),
    reservedOpen: z.number().min(0).max(1),
    supportiveChallenging: z.number().min(0).max(1),
  }).default({
    gentleDirect: 0.5,
    emotionalAnalytical: 0.5,
    structuredFlexible: 0.5,
    reservedOpen: 0.5,
    supportiveChallenging: 0.5,
  }),
  selectedTheme: z.string().max(100).default(""),
})

export type OnboardingPayload = z.infer<typeof onboardingSchema>

/** Map Zustand store fields to Supabase column names */
export function toSupabaseRow(data: OnboardingPayload, userId: string) {
  return {
    user_id: userId,
    current_step: data.currentStep,
    acquisition_source: data.acquisitionSource || null,
    age_range: data.ageRange || null,
    gender: data.gender || null,
    occupation: data.occupation || null,
    relationship_status: data.relationshipStatus || null,
    support_type: data.supportType || null,
    current_struggles: data.currentStruggles,
    life_events: data.lifeEvents,
    commitment_weeks: data.commitmentGoal,
    voice_persona_id: data.voicePersonaId || null,
    communication_approach: data.communicationApproach || null,
    radar_calibration: data.radarCalibration,
    selected_theme: data.selectedTheme || null,
    updated_at: new Date().toISOString(),
  }
}

/** Map Supabase row to store-compatible shape */
export function fromSupabaseRow(row: Record<string, unknown>) {
  return {
    currentStep: (row.current_step as number) || 1,
    acquisitionSource: (row.acquisition_source as string) || "",
    ageRange: (row.age_range as string) || "",
    gender: (row.gender as string) || "",
    occupation: (row.occupation as string) || "",
    relationshipStatus: (row.relationship_status as string) || "",
    supportType: (row.support_type as string) || "",
    currentStruggles: (row.current_struggles as string[]) || [],
    lifeEvents: (row.life_events as string[]) || [],
    commitmentGoal: (row.commitment_weeks as number) || 3,
    voicePersonaId: (row.voice_persona_id as string) || "",
    communicationApproach: (row.communication_approach as string) || "",
    radarCalibration: (row.radar_calibration as Record<string, number>) || {
      gentleDirect: 0.5,
      emotionalAnalytical: 0.5,
      structuredFlexible: 0.5,
      reservedOpen: 0.5,
      supportiveChallenging: 0.5,
    },
    selectedTheme: (row.selected_theme as string) || "",
    completedAt: (row.completed_at as string) || null,
  }
}
