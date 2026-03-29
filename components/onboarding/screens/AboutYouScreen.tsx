"use client"

import { useState } from "react"
import { WizardLayout, SurveyRadio, FABArrow, StepProgress } from "../shared"
import { useOnboardingStore } from "@/store/onboardingStore"

interface AboutYouScreenProps {
  onNext: () => void
  onSkip: () => void
  onBack?: () => void
}

const AGE_OPTIONS = [
  { value: "18-24", label: "18-24" },
  { value: "25-34", label: "25-34" },
  { value: "35-44", label: "35-44" },
  { value: "45-54", label: "45-54" },
  { value: "55-64", label: "55-64" },
  { value: "65+", label: "65+" },
  { value: "prefer_not", label: "Prefer not to say" },
]

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non_binary", label: "Non-binary" },
  { value: "other", label: "Other" },
  { value: "prefer_not", label: "Prefer not to say" },
]

export function AboutYouScreen({ onNext, onSkip, onBack }: AboutYouScreenProps) {
  const { ageRange, gender, setField } = useOnboardingStore()
  const [localAge, setLocalAge] = useState(ageRange)
  const [localGender, setLocalGender] = useState(gender)

  function handleNext() {
    setField("ageRange", localAge)
    setField("gender", localGender)
    onNext()
  }

  const canProceed = localAge !== "" && localGender !== ""

  return (
    <WizardLayout step={1} totalSteps={10} onSkip={onSkip} onBack={onBack}>
      <div className="w-full max-w-md space-y-8">
        <div>
          <h1 className="mb-6 text-2xl font-bold text-white">About you</h1>

          <h2 className="mb-3 text-[15px] font-medium text-white/70">
            What&apos;s your age range?
          </h2>
          <SurveyRadio
            options={AGE_OPTIONS}
            value={localAge}
            onChange={setLocalAge}
          />
        </div>

        <div>
          <h2 className="mb-3 text-[15px] font-medium text-white/70">
            How do you identify?
          </h2>
          <SurveyRadio
            options={GENDER_OPTIONS}
            value={localGender}
            onChange={setLocalGender}
          />
        </div>
      </div>
      <div />
      <FABArrow onClick={handleNext} disabled={!canProceed} />
    </WizardLayout>
  )
}
