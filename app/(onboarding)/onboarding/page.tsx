"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { useOnboardingStore, hydrateFromServer } from "@/store/onboardingStore"
import { ResumeInterstitial } from "@/components/onboarding/shared"

// Lazy-load screen groups for code splitting
const GettingToKnowYouScreen = dynamic(() => import("@/components/onboarding/screens/GettingToKnowYouScreen").then(m => ({ default: m.GettingToKnowYouScreen })))
const AboutYouScreen = dynamic(() => import("@/components/onboarding/screens/AboutYouScreen").then(m => ({ default: m.AboutYouScreen })))
const YourLifeScreen = dynamic(() => import("@/components/onboarding/screens/YourLifeScreen").then(m => ({ default: m.YourLifeScreen })))
const SupportTypeScreen = dynamic(() => import("@/components/onboarding/screens/SupportTypeScreen").then(m => ({ default: m.SupportTypeScreen })))
const StrugglesScreen = dynamic(() => import("@/components/onboarding/screens/StrugglesScreen").then(m => ({ default: m.StrugglesScreen })))
const LifeEventsScreen = dynamic(() => import("@/components/onboarding/screens/LifeEventsScreen").then(m => ({ default: m.LifeEventsScreen })))
const AnalyzingScreen = dynamic(() => import("@/components/onboarding/screens/AnalyzingScreen").then(m => ({ default: m.AnalyzingScreen })))
const ProvenResultsScreen = dynamic(() => import("@/components/onboarding/screens/ProvenResultsScreen").then(m => ({ default: m.ProvenResultsScreen })))
const PrivacyScreen = dynamic(() => import("@/components/onboarding/screens/PrivacyScreen").then(m => ({ default: m.PrivacyScreen })))
const CommitmentScreen = dynamic(() => import("@/components/onboarding/screens/CommitmentScreen").then(m => ({ default: m.CommitmentScreen })))
const DailyStructureScreen = dynamic(() => import("@/components/onboarding/screens/DailyStructureScreen").then(m => ({ default: m.DailyStructureScreen })))
const CustomizingCoachScreen = dynamic(() => import("@/components/onboarding/screens/CustomizingCoachScreen").then(m => ({ default: m.CustomizingCoachScreen })))
const VoiceSelectionScreen = dynamic(() => import("@/components/onboarding/screens/VoiceSelectionScreen").then(m => ({ default: m.VoiceSelectionScreen })))
const CommunicationStyleScreen = dynamic(() => import("@/components/onboarding/screens/CommunicationStyleScreen").then(m => ({ default: m.CommunicationStyleScreen })))
const AICalibrationScreen = dynamic(() => import("@/components/onboarding/screens/AICalibrationScreen").then(m => ({ default: m.AICalibrationScreen })), { ssr: false })
const BuildingCoachScreen = dynamic(() => import("@/components/onboarding/screens/BuildingCoachScreen").then(m => ({ default: m.BuildingCoachScreen })))
const AvatarCreatorScreen = dynamic(() => import("@/components/onboarding/screens/AvatarCreatorScreen").then(m => ({ default: m.AvatarCreatorScreen })))
const SetupCompleteScreen = dynamic(() => import("@/components/onboarding/screens/SetupCompleteScreen").then(m => ({ default: m.SetupCompleteScreen })))
const ConnectingScreen = dynamic(() => import("@/components/onboarding/screens/ConnectingScreen").then(m => ({ default: m.ConnectingScreen })))

const TOTAL_STEPS = 19 // Post-auth steps (7-25)

export default function OnboardingPage() {
  const { currentStep, setStep, nextStep, reset } = useOnboardingStore()
  const [showResume, setShowResume] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from server on mount
  useEffect(() => {
    async function hydrate() {
      const hasServerData = await hydrateFromServer()
      if (hasServerData && currentStep > 7) {
        setShowResume(true)
      }
      setHydrated(true)
    }
    hydrate()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSkip = useCallback(() => nextStep(), [nextStep])
  const handleBack = useCallback(() => {
    const prev = useOnboardingStore.getState().currentStep
    // Don't go below step 7 (start of post-auth flow)
    if (prev > 7) {
      useOnboardingStore.getState().prevStep()
    }
  }, [])

  // Ensure post-auth flow starts at step 7
  useEffect(() => {
    if (hydrated && currentStep < 7) {
      setStep(7)
    }
  }, [hydrated, currentStep, setStep])

  if (!hydrated) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#080808]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FFD41A] border-t-transparent" />
      </div>
    )
  }

  if (showResume) {
    return (
      <ResumeInterstitial
        currentStep={currentStep - 7}
        totalSteps={TOTAL_STEPS}
        onResume={() => setShowResume(false)}
        onStartOver={() => {
          reset()
          setStep(7)
          setShowResume(false)
        }}
      />
    )
  }

  // Map step number to screen component (onBack on all except step 7)
  switch (currentStep) {
    case 7:
      return <GettingToKnowYouScreen onNext={nextStep} />
    case 8:
      return <AboutYouScreen onNext={nextStep} onSkip={handleSkip} onBack={handleBack} />
    case 9:
      return <YourLifeScreen onNext={nextStep} onSkip={handleSkip} onBack={handleBack} />
    case 10:
      return <SupportTypeScreen onNext={nextStep} onSkip={handleSkip} onBack={handleBack} />
    case 11:
      return <StrugglesScreen onNext={nextStep} onSkip={handleSkip} onBack={handleBack} />
    case 12:
      return <LifeEventsScreen onNext={nextStep} onSkip={handleSkip} onBack={handleBack} />
    case 13:
      return <AnalyzingScreen onComplete={nextStep} onSkip={handleSkip} />
    case 14:
      return <ProvenResultsScreen onNext={nextStep} onBack={handleBack} />
    case 15:
      return <PrivacyScreen onNext={nextStep} onBack={handleBack} />
    case 16:
      return <CommitmentScreen onNext={nextStep} onBack={handleBack} />
    case 17:
      return <DailyStructureScreen onNext={nextStep} onBack={handleBack} />
    case 18:
      return <CustomizingCoachScreen onNext={nextStep} onBack={handleBack} />
    case 19:
      return <VoiceSelectionScreen onNext={nextStep} onSkip={handleSkip} onBack={handleBack} />
    case 20:
      return <CommunicationStyleScreen onNext={nextStep} onSkip={handleSkip} onBack={handleBack} />
    case 21:
      return <AICalibrationScreen onNext={nextStep} onBack={handleBack} />
    case 22:
      return <BuildingCoachScreen onComplete={nextStep} />
    case 23:
      return <AvatarCreatorScreen onNext={nextStep} onSkip={handleSkip} onBack={handleBack} />
    case 24:
      return <SetupCompleteScreen onNext={nextStep} />
    case 25:
      return <ConnectingScreen />
    default:
      return <ConnectingScreen />
  }
}
