"use client"

import { Progress } from "@/components/ui/progress"

interface StepProgressProps {
  currentStep: number
  totalSteps: number
  stepName: string | null
  currentDay?: number
  totalDays?: number
  isDayLocked?: boolean
  allowedStepMin?: number
  allowedStepMax?: number
}

export function StepProgress({
  currentStep,
  totalSteps,
  stepName,
  currentDay = 1,
  totalDays = 3,
  isDayLocked = false,
  allowedStepMin = 1,
  allowedStepMax = 5,
}: StepProgressProps) {
  const stepsInDay = allowedStepMax - allowedStepMin + 1
  const dayProgress = Math.max(0, Math.min(currentStep - allowedStepMin + 1, stepsInDay))
  const percent = stepsInDay > 0 ? (dayProgress / stepsInDay) * 100 : 0

  return (
    <div className="flex items-center gap-3 border-b border-gray-800 bg-black/60 backdrop-blur-sm px-4 py-2">
      <div className="flex-1">
        <Progress value={percent} className="h-1.5 bg-gray-800" />
      </div>
      <div className="shrink-0 text-xs text-gray-400">
        {isDayLocked ? (
          <span className="text-yellow-400/70">Locked</span>
        ) : (
          <>
            {stepName && <span className="mr-2">{stepName}</span>}
            <span className="text-yellow-400 font-medium">
              Section {currentDay} &mdash; {dayProgress}/{stepsInDay}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
