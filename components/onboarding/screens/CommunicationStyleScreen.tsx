"use client"

import { useState } from "react"
import { WizardLayout, SurveyRadio, OnboardingButton } from "../shared"
import { useOnboardingStore } from "@/store/onboardingStore"

interface CommunicationStyleScreenProps {
  onNext: () => void
  onSkip: () => void
  onBack?: () => void
}

const OPTIONS = [
  { value: "balanced", label: "Balanced", description: "A mix of empathy and practical guidance" },
  { value: "supportive", label: "Supportive", description: "Warm, empathetic, focuses on feelings" },
  { value: "analytical", label: "Analytical", description: "Structured, logical, focuses on patterns" },
  { value: "direct", label: "Direct", description: "Honest, to the point, action-oriented" },
]

export function CommunicationStyleScreen({ onNext, onSkip, onBack }: CommunicationStyleScreenProps) {
  const { communicationApproach, setField } = useOnboardingStore()
  const [selected, setSelected] = useState(communicationApproach || "")

  function handleNext() {
    if (selected) {
      setField("communicationApproach", selected)
      onNext()
    }
  }

  return (
    <WizardLayout onSkip={onSkip} onBack={onBack}>
      <div className="w-full max-w-md">
        <h1 className="mb-2 text-2xl font-bold text-white">
          How should Rumi communicate with you?
        </h1>
        <p className="mb-8 text-[15px] text-white/50">
          You can change this at any time in settings.
        </p>
        <SurveyRadio options={OPTIONS} value={selected} onChange={setSelected} />
      </div>
      <div />
      <div className="w-full max-w-sm">
        <OnboardingButton onClick={handleNext} disabled={!selected}>
          Continue
        </OnboardingButton>
      </div>
    </WizardLayout>
  )
}
