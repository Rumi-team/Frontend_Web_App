"use client"

import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

interface WizardLayoutProps {
  children: React.ReactNode
  /** Current step for progress bar (1-based). Pass 0 to hide progress. */
  step?: number
  /** Total steps for progress calculation */
  totalSteps?: number
  /** Show subtle "Skip" link */
  onSkip?: () => void
  className?: string
}

export function WizardLayout({
  children,
  step = 0,
  totalSteps = 25,
  onSkip,
  className,
}: WizardLayoutProps) {
  const showProgress = step > 0

  return (
    <div
      className={cn(
        "flex min-h-[100dvh] flex-col bg-[#080808] text-white",
        className
      )}
    >
      {showProgress && (
        <div className="px-4 pt-3">
          <Progress
            value={(step / totalSteps) * 100}
            className="h-1 bg-white/10 [&>div]:bg-[#FFD41A]"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col items-center justify-between px-6 py-8">
        {children}
      </div>

      {onSkip && (
        <div className="pb-6 text-center">
          <button
            type="button"
            onClick={onSkip}
            className="text-sm text-white/40 transition-colors hover:text-white/60"
          >
            Skip for now
          </button>
        </div>
      )}
    </div>
  )
}
