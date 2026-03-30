import { create } from "zustand"
import { persist } from "zustand/middleware"

interface SettingsState {
  selectedVoice: string
  aiStyle: string
  radarCalibration: Record<string, number>
  customInstructions: string
  selectedTheme: string
  lightDark: "light" | "dark"
  appLock: boolean
  backgroundMusic: boolean
  particles: boolean
  edgeGlow: boolean
  homeScreenQuote: boolean
  streakCelebration: boolean
  hapticFeedback: boolean
  showAvatar: boolean
  activeQuests: string[]
  _hydrated: boolean
  setField: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void
  toggleQuest: (questId: string) => void
  hydrateFromOnboarding: (data: {
    voicePersonaId: string
    communicationApproach: string
    radarCalibration: Record<string, number>
    selectedTheme: string
  }) => void
  hydrate: (data: Partial<SettingsState>) => void
}

let saveTimeout: NodeJS.Timeout | null = null

function debouncedSave(state: SettingsState) {
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(async () => {
    try {
      await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selected_voice: state.selectedVoice,
          ai_style: state.aiStyle,
          radar_calibration: state.radarCalibration,
          custom_instructions: state.customInstructions,
          selected_theme: state.selectedTheme,
          light_dark: state.lightDark,
          app_lock: state.appLock,
          background_music: state.backgroundMusic,
          particles: state.particles,
          edge_glow: state.edgeGlow,
          home_screen_quote: state.homeScreenQuote,
          streak_celebration: state.streakCelebration,
          haptic_feedback: state.hapticFeedback,
          show_avatar: state.showAvatar,
          active_quests: state.activeQuests,
        }),
      })
    } catch {
      // Silently fail — local store is correct
    }
  }, 1500)
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
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

      setField: (key, value) => {
        set({ [key]: value } as Partial<SettingsState>)
        debouncedSave(get())
      },

      toggleQuest: (questId: string) => {
        const current = get().activeQuests
        const next = current.includes(questId)
          ? current.filter((q) => q !== questId)
          : [...current, questId]
        set({ activeQuests: next })
        debouncedSave(get())
      },

      hydrateFromOnboarding: (data) => {
        set({
          selectedVoice: data.voicePersonaId,
          aiStyle: data.communicationApproach,
          radarCalibration: data.radarCalibration,
          selectedTheme: data.selectedTheme || "forest_light",
          _hydrated: true,
        })
        debouncedSave(get())
      },

      hydrate: (data) => {
        set(data)
      },
    }),
    {
      name: "rumi-settings",
      partialize: (state) => ({
        selectedVoice: state.selectedVoice,
        aiStyle: state.aiStyle,
        radarCalibration: state.radarCalibration,
        customInstructions: state.customInstructions,
        selectedTheme: state.selectedTheme,
        lightDark: state.lightDark,
        appLock: state.appLock,
        backgroundMusic: state.backgroundMusic,
        particles: state.particles,
        edgeGlow: state.edgeGlow,
        homeScreenQuote: state.homeScreenQuote,
        streakCelebration: state.streakCelebration,
        hapticFeedback: state.hapticFeedback,
        showAvatar: state.showAvatar,
        activeQuests: state.activeQuests,
        _hydrated: state._hydrated,
      }),
    }
  )
)
