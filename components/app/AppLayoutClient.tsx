"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthProvider, useAuth } from "@/components/auth-provider"
import { BottomNav } from "@/components/app/shared/BottomNav"
import { useSettingsStore } from "@/store/settingsStore"
import { useOnboardingStore } from "@/store/onboardingStore"

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

  if (!authenticated && !user) {
    return null
  }

  return (
    <div className="flex min-h-dvh flex-col" style={{ background: "#FAF8F3" }}>
      <main className="flex-1 pb-20">{children}</main>
      <BottomNav />
    </div>
  )
}
