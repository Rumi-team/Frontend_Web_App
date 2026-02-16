"use client"

import { Progress } from "@/components/ui/progress"

interface StepProgressProps {
  currentStep: number
  totalSteps: number
  stepName: string | null
}

export function StepProgress({
  currentStep,
  totalSteps,
  stepName,
}: StepProgressProps) {
  const percent = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0

  return (
    <div className="flex items-center gap-3 border-b border-gray-800 bg-black/60 backdrop-blur-sm px-4 py-2">
      <div className="flex-1">
        <Progress value={percent} className="h-1.5 bg-gray-800" />
      </div>
      <div className="shrink-0 text-xs text-gray-400">
        {stepName && <span className="mr-2">{stepName}</span>}
        <span className="text-yellow-400 font-medium">
          {currentStep}/{totalSteps}
        </span>
      </div>
    </div>
  )
}
