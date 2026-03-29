"use client"

import { useState } from "react"
import { WizardLayout, SurveyMultiSelect, FABArrow } from "../shared"
import { useOnboardingStore } from "@/store/onboardingStore"

interface LifeEventsScreenProps {
  onNext: () => void
  onSkip: () => void
  onBack?: () => void
}

const LIFE_EVENTS = [
  "Starting a new job or career change",
  "Ending a relationship or divorce",
  "Moving to a new city",
  "Becoming a parent",
  "Loss of a loved one",
  "Health challenges",
  "Financial stress",
  "Starting or finishing school",
  "Retirement",
  "Major life transition",
  "None of these apply",
]

export function LifeEventsScreen({ onNext, onSkip, onBack }: LifeEventsScreenProps) {
  const { lifeEvents, setField } = useOnboardingStore()
  const [selected, setSelected] = useState<string[]>(lifeEvents)

  function handleNext() {
    setField("lifeEvents", selected)
    onNext()
  }

  return (
    <WizardLayout step={5} totalSteps={10} onSkip={onSkip} onBack={onBack}>
      <div className="w-full max-w-md">
        <h1 className="mb-2 text-2xl font-bold text-white">
          Any major life events recently?
        </h1>
        <SurveyMultiSelect
          options={LIFE_EVENTS}
          selected={selected}
          onChange={setSelected}
        />
      </div>
      <div />
      <FABArrow onClick={handleNext} disabled={selected.length === 0} />
    </WizardLayout>
  )
}
