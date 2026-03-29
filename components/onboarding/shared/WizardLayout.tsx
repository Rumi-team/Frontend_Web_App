"use client"

import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft } from "lucide-react"

interface WizardLayoutProps {
  children: React.ReactNode
  /** Current step for progress bar (1-based). Pass 0 to hide progress. */
  step?: number
  /** Total steps for progress calculation */
  totalSteps?: number
  /** Show subtle "Skip" link */
  onSkip?: () => void
  /** Show back button */
  onBack?: () => void
  className?: string
}

export function WizardLayout({
  children,
  step = 0,
  totalSteps = 25,
  onSkip,
  onBack,
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
      <div className="flex items-center px-4 pt-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/5 hover:text-white/80"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        ) : (
          <div className="h-10 w-10" />
        )}
        {showProgress && (
          <div className="flex-1 px-2">
            <Progress
              value={(step / totalSteps) * 100}
              className="h-1 bg-white/10 [&>div]:bg-[#FFD41A]"
            />
          </div>
        )}
        {!showProgress && <div className="flex-1" />}
        <div className="h-10 w-10" />
      </div>

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
