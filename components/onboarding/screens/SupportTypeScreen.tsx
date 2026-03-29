"use client"

import { useState } from "react"
import { WizardLayout, SurveyRadio, FABArrow } from "../shared"
import { useOnboardingStore, type SupportType } from "@/store/onboardingStore"

interface SupportTypeScreenProps {
  onNext: () => void
  onSkip: () => void
}

const OPTIONS = [
  { value: "emotional", label: "Emotional support", description: "Someone to listen and help me process my feelings" },
  { value: "coaching", label: "Life coaching", description: "Structured guidance to reach my goals" },
  { value: "both", label: "Both", description: "Emotional support and practical coaching" },
  { value: "unsure", label: "I'm not sure yet", description: "Help me figure out what I need" },
]

export function SupportTypeScreen({ onNext, onSkip }: SupportTypeScreenProps) {
  const { supportType, setField } = useOnboardingStore()
  const [selected, setSelected] = useState(supportType || "")

  function handleNext() {
    if (selected) {
      setField("supportType", selected as SupportType)
      onNext()
    }
  }

  return (
    <WizardLayout step={3} totalSteps={10} onSkip={onSkip}>
      <div className="w-full max-w-md">
        <h1 className="mb-2 text-2xl font-bold text-white">
          What kind of support are you looking for?
        </h1>
        <p className="mb-8 text-[15px] text-white/50">
          This helps Rumi tailor your experience.
        </p>
        <SurveyRadio options={OPTIONS} value={selected} onChange={setSelected} />
      </div>
      <div />
      <FABArrow onClick={handleNext} disabled={!selected} />
    </WizardLayout>
  )
}
