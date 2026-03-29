"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { WelcomeScreen } from "@/components/onboarding/screens/WelcomeScreen"
import { MissionScreen } from "@/components/onboarding/screens/MissionScreen"
import { AcquisitionScreen } from "@/components/onboarding/screens/AcquisitionScreen"
import { AuthConsentScreen } from "@/components/onboarding/screens/AuthConsentScreen"
import { AccountLoadingScreen } from "@/components/onboarding/screens/AccountLoadingScreen"
import { createSupabaseBrowserClient } from "@/lib/supabase-auth-browser"
import { useOnboardingStore } from "@/store/onboardingStore"

type PreAuthStep = "welcome" | "mission" | "acquisition" | "auth" | "loading"

export default function WelcomePage() {
  const [step, setStep] = useState<PreAuthStep>("welcome")
  const router = useRouter()
  const store = useOnboardingStore()

  const handleOAuth = useCallback(
    async (provider: "google" | "apple") => {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/onboarding`,
          skipBrowserRedirect: false,
        },
      })
      if (error) {
        console.error("OAuth error:", error.message)
        return
      }
      // OAuth will redirect; show loading in the meantime
      setStep("loading")
    },
    []
  )

  const handleEmailAuth = useCallback(() => {
    // Redirect to existing login page with return-to param
    router.push("/login?returnTo=/onboarding")
  }, [router])

  const handleLoadingComplete = useCallback(() => {
    router.push("/onboarding")
  }, [router])

  switch (step) {
    case "welcome":
      return <WelcomeScreen onNext={() => setStep("mission")} />
    case "mission":
      return <MissionScreen onNext={() => setStep("acquisition")} />
    case "acquisition":
      return (
        <AcquisitionScreen
          onNext={() => setStep("auth")}
        />
      )
    case "auth":
      return (
        <AuthConsentScreen
          onGoogleAuth={() => handleOAuth("google")}
          onAppleAuth={() => handleOAuth("apple")}
          onEmailAuth={handleEmailAuth}
        />
      )
    case "loading":
      return <AccountLoadingScreen onComplete={handleLoadingComplete} />
    default:
      return null
  }
}
