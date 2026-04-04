"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthProvider, useAuth } from "@/components/auth-provider"
import { BottomNav } from "@/components/app/shared/BottomNav"
import { useSettingsStore } from "@/store/settingsStore"
import { useOnboardingStore } from "@/store/onboardingStore"
import { useUserStore } from "@/store/userStore"

interface AppLayoutClientProps {
  children: React.ReactNode
  authenticated: boolean
}

export function AppLayoutClient({ children, authenticated }: AppLayoutClientProps) {
  return (
    <AuthProvider>
      <AppLayoutInner authenticated={authenticated}>
        {children}
      </AppLayoutInner>
    </AuthProvider>
  )
}

function AppLayoutInner({
  children,
  authenticated,
}: {
  children: React.ReactNode
  authenticated: boolean
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const _hydrated = useSettingsStore((s) => s._hydrated)
  const hydrateFromOnboarding = useSettingsStore((s) => s.hydrateFromOnboarding)

  // Auth check — same pattern as CoachShell
  useEffect(() => {
    if (!authenticated && user) {
      router.refresh()
    } else if (!authenticated && !user && !isLoading) {
      window.location.href = "/login"
    }
  }, [authenticated, user, isLoading, router])

  // One-time settings hydration from onboarding store
  useEffect(() => {
    if (!_hydrated) {
      const onboarding = useOnboardingStore.getState()
      if (onboarding.voicePersonaId || onboarding.selectedTheme) {
        hydrateFromOnboarding({
          voicePersonaId: onboarding.voicePersonaId,
          communicationApproach: onboarding.communicationApproach,
          radarCalibration: onboarding.radarCalibration,
          selectedTheme: onboarding.selectedTheme,
        })
      }
    }
  }, [_hydrated, hydrateFromOnboarding])

  // Hydrate user progress from DB + validate streak on app load
  useEffect(() => {
    async function loadProgress() {
      try {
        const res = await fetch("/api/user/progress")
        if (!res.ok) return
        const data = await res.json()
        useUserStore.getState().hydrate({
          xp: data.xp ?? 0,
          streak: data.streak ?? 0,
          wordCount: data.word_count ?? 0,
          sessionsCompleted: data.sessions_completed ?? 0,
          lastSessionDate: data.last_session_date ?? null,
        })
      } catch {
        // Fall back to localStorage values
      }
      useUserStore.getState().validateStreak()
    }
    loadProgress()
  }, [])

  if (!authenticated && !user) {
    return null
  }

  return (
    <div className="flex min-h-dvh flex-col" style={{ background: "var(--app-bg, #FAF8F3)" }}>
      <main className="flex-1 pb-20">{children}</main>
      <BottomNav />
    </div>
  )
}
