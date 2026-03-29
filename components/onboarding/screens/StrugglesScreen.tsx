"use client"

import { useState } from "react"
import { WizardLayout, SurveyMultiSelect, FABArrow } from "../shared"
import { useOnboardingStore } from "@/store/onboardingStore"

interface StrugglesScreenProps {
  onNext: () => void
  onSkip: () => void
}

const STRUGGLES = [
  "Stress and overwhelm",
  "Anxiety or worry",
  "Low mood or sadness",
  "Relationship difficulties",
  "Work-life balance",
  "Self-confidence",
  "Loneliness or isolation",
  "Sleep issues",
  "Grief or loss",
  "Motivation and direction",
  "Anger management",
  "Burnout",
]

export function StrugglesScreen({ onNext, onSkip }: StrugglesScreenProps) {
  const { currentStruggles, setField } = useOnboardingStore()
  const [selected, setSelected] = useState<string[]>(currentStruggles)

  function handleNext() {
    setField("currentStruggles", selected)
    onNext()
  }

  return (
    <WizardLayout step={4} totalSteps={10} onSkip={onSkip}>
      <div className="w-full max-w-md">
        <h1 className="mb-2 text-2xl font-bold text-white">
          What are you dealing with right now?
        </h1>
        <SurveyMultiSelect
          options={STRUGGLES}
          selected={selected}
          onChange={setSelected}
        />
      </div>
      <div />
      <FABArrow onClick={handleNext} disabled={selected.length === 0} />
    </WizardLayout>
  )
}
