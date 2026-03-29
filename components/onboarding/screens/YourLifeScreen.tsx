"use client"

import { useState } from "react"
import { WizardLayout, SurveyRadio, FABArrow } from "../shared"
import { useOnboardingStore } from "@/store/onboardingStore"

interface YourLifeScreenProps {
  onNext: () => void
  onSkip: () => void
  onBack?: () => void
}

const OCCUPATION_OPTIONS = [
  { value: "employed", label: "Employed full-time" },
  { value: "part_time", label: "Employed part-time" },
  { value: "self_employed", label: "Self-employed" },
  { value: "student", label: "Student" },
  { value: "stay_home", label: "Stay-at-home parent" },
  { value: "retired", label: "Retired" },
  { value: "between_jobs", label: "Between jobs" },
  { value: "prefer_not", label: "Prefer not to say" },
]

const RELATIONSHIP_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "in_relationship", label: "In a relationship" },
  { value: "married", label: "Married / Domestic partner" },
  { value: "divorced", label: "Divorced / Separated" },
  { value: "widowed", label: "Widowed" },
  { value: "its_complicated", label: "It's complicated" },
  { value: "prefer_not", label: "Prefer not to say" },
]

export function YourLifeScreen({ onNext, onSkip, onBack }: YourLifeScreenProps) {
  const { occupation, relationshipStatus, setField } = useOnboardingStore()
  const [localOcc, setLocalOcc] = useState(occupation)
  const [localRel, setLocalRel] = useState(relationshipStatus)

  function handleNext() {
    setField("occupation", localOcc)
    setField("relationshipStatus", localRel)
    onNext()
  }

  const canProceed = localOcc !== "" && localRel !== ""

  return (
    <WizardLayout step={2} totalSteps={10} onSkip={onSkip} onBack={onBack}>
      <div className="w-full max-w-md space-y-8">
        <div>
          <h1 className="mb-6 text-2xl font-bold text-white">Your life</h1>

          <h2 className="mb-3 text-[15px] font-medium text-white/70">
            What best describes your day-to-day?
          </h2>
          <SurveyRadio
            options={OCCUPATION_OPTIONS}
            value={localOcc}
            onChange={setLocalOcc}
          />
        </div>

        <div>
          <h2 className="mb-3 text-[15px] font-medium text-white/70">
            Relationship status
          </h2>
          <SurveyRadio
            options={RELATIONSHIP_OPTIONS}
            value={localRel}
            onChange={setLocalRel}
          />
        </div>
      </div>
      <div />
      <FABArrow onClick={handleNext} disabled={!canProceed} />
    </WizardLayout>
  )
}
