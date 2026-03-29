"use client"

import { useState } from "react"
import { WizardLayout, SurveyRadio, FABArrow } from "../shared"
import { useOnboardingStore } from "@/store/onboardingStore"

interface AcquisitionScreenProps {
  onNext: () => void
}

const OPTIONS = [
  { value: "therapist", label: "Recommended by my therapist" },
  { value: "friends_family", label: "Friends or family" },
  { value: "social_media", label: "Social media" },
  { value: "search", label: "Web search" },
  { value: "podcast", label: "Podcast or article" },
  { value: "app_store", label: "App store browsing" },
  { value: "other", label: "Something else" },
]

export function AcquisitionScreen({ onNext }: AcquisitionScreenProps) {
  const { acquisitionSource, setField } = useOnboardingStore()
  const [selected, setSelected] = useState(acquisitionSource)

  function handleSelect(value: string) {
    setSelected(value)
    setField("acquisitionSource", value)
  }

  function handleNext() {
    if (selected) onNext()
  }

  return (
    <WizardLayout>
      <div className="w-full max-w-md">
        <h1 className="mb-2 text-2xl font-bold text-white">
          How did you find Rumi?
        </h1>
        <p className="mb-8 text-[15px] text-white/50">
          This helps us understand how people discover us.
        </p>
        <SurveyRadio
          options={OPTIONS}
          value={selected}
          onChange={handleSelect}
        />
      </div>
      <div />
      <FABArrow onClick={handleNext} disabled={!selected} />
    </WizardLayout>
  )
}
