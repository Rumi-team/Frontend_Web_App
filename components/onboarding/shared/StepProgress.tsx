"use client"

interface StepProgressProps {
  /** Current step within the survey section (1-based) */
  current: number
  /** Total steps in survey section */
  total: number
}

export function StepProgress({ current, total }: StepProgressProps) {
  return (
    <div className="flex w-full gap-1.5 px-4 pt-3">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="h-1 flex-1 rounded-full transition-colors"
          style={{
            backgroundColor:
              i < current ? "#FFD41A" : "rgba(255,255,255,0.1)",
          }}
        />
      ))}
    </div>
  )
}
