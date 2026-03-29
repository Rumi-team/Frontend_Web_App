import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface RadarCalibration {
  gentleDirect: number // 0-1, 0 = gentle, 1 = direct
  emotionalAnalytical: number
  structuredFlexible: number
  reservedOpen: number
  supportiveChallenging: number
}

const DEFAULT_RADAR: RadarCalibration = {
  gentleDirect: 0.5,
  emotionalAnalytical: 0.5,
  structuredFlexible: 0.5,
  reservedOpen: 0.5,
  supportiveChallenging: 0.5,
}

export type SupportType = "emotional" | "coaching" | "both" | "unsure" | ""
export type CommitmentGoal = 1 | 2 | 3 | 4

export interface OnboardingData {
  acquisitionSource: string
  ageRange: string
  gender: string
  occupation: string
  relationshipStatus: string
  supportType: SupportType
  currentStruggles: string[]
  lifeEvents: string[]
  commitmentGoal: CommitmentGoal
  voicePersonaId: string
  communicationApproach: string
  radarCalibration: RadarCalibration
  selectedTheme: string
}

interface OnboardingState extends OnboardingData {
  currentStep: number
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  setField: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void
  reset: () => void
}

const INITIAL_DATA: OnboardingData = {
  acquisitionSource: "",
  ageRange: "",
  gender: "",
  occupation: "",
  relationshipStatus: "",
  supportType: "",
  currentStruggles: [],
  lifeEvents: [],
  commitmentGoal: 3,
  voicePersonaId: "",
  communicationApproach: "",
  radarCalibration: DEFAULT_RADAR,
  selectedTheme: "",
}

// Debounced save to server
let saveTimeout: ReturnType<typeof setTimeout> | null = null

function debouncedSaveToServer(state: OnboardingData & { currentStep: number }) {
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(async () => {
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      })
    } catch {
      // Silent fail — localStorage is the primary persistence
    }
  }, 1500)
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      ...INITIAL_DATA,

      setStep: (step) => {
        set({ currentStep: step })
      },

      nextStep: () => {
        const next = get().currentStep + 1
        set({ currentStep: next })
        const { setStep, nextStep, prevStep, setField, reset, ...data } = get()
        debouncedSaveToServer({ ...data, currentStep: next })
      },

      prevStep: () => {
        const prev = Math.max(1, get().currentStep - 1)
        set({ currentStep: prev })
      },

      setField: (key, value) => {
        set({ [key]: value } as Partial<OnboardingState>)
      },

      reset: () => {
        set({ currentStep: 1, ...INITIAL_DATA })
        if (saveTimeout) clearTimeout(saveTimeout)
      },
    }),
    {
      name: "rumi-onboarding",
    }
  )
)

/** Hydrate store from server data (for cross-device resume) */
export async function hydrateFromServer(): Promise<boolean> {
  try {
    const res = await fetch("/api/onboarding")
    if (!res.ok) return false
    const data = await res.json()
    if (data && data.currentStep) {
      const store = useOnboardingStore.getState()
      store.setStep(data.currentStep)
      for (const key of Object.keys(INITIAL_DATA) as (keyof OnboardingData)[]) {
        if (data[key] !== undefined && data[key] !== null) {
          store.setField(key, data[key])
        }
      }
      return true
    }
    return false
  } catch {
    return false
  }
}
