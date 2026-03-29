"use client"

import { WizardLayout, ProgressiveChecklist } from "../shared"

interface BuildingCoachScreenProps {
  onComplete: () => void
}

const STEPS = [
  "Applying your personality preferences",
  "Setting communication style",
  "Calibrating voice and tone",
  "Loading your personal context",
  "Finalizing your coach profile",
]

export function BuildingCoachScreen({ onComplete }: BuildingCoachScreenProps) {
  return (
    <WizardLayout>
      <div />
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-center text-2xl font-bold text-white">
          Building your coach...
        </h1>
        <ProgressiveChecklist items={STEPS} delayMs={600} onComplete={onComplete} />
      </div>
      <div />
    </WizardLayout>
  )
}
