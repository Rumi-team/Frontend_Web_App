"use client"

import { useState, useCallback } from "react"
import { useStepProgress, type StepInfo } from "@/hooks/use-step-progress"
import { SectionBanner } from "./section-banner"
import { StepNode } from "./step-node"
import { StepSummarySheet } from "./step-summary-sheet"

interface JourneyPathProps {
  displayName?: string | null
  onStartSession: () => void
}

export function JourneyPath({ displayName, onStartSession }: JourneyPathProps) {
  const { data, loading } = useStepProgress()
  const [selectedStep, setSelectedStep] = useState<StepInfo | null>(null)
  const [holdProgress, setHoldProgress] = useState(0)
  const [holdTimer, setHoldTimer] = useState<ReturnType<typeof setInterval> | null>(null)

  const handleStepTap = useCallback((step: StepInfo) => {
    if (step.status === "completed") {
      setSelectedStep(step)
    }
    // Current step: handled by hold-to-start below
    // Locked: no-op (button is disabled)
  }, [])

  // Hold-to-start for current step (3s hold)
  const handleHoldStart = useCallback(() => {
    setHoldProgress(0)
    const interval = setInterval(() => {
      setHoldProgress((prev) => {
        const next = prev + (100 / 30) // 30 ticks over 3 seconds (100ms each)
        if (next >= 100) {
          clearInterval(interval)
          onStartSession()
          return 100
        }
        return next
      })
    }, 100)
    setHoldTimer(interval)
  }, [onStartSession])

  const handleHoldEnd = useCallback(() => {
    if (holdTimer) {
      clearInterval(holdTimer)
      setHoldTimer(null)
    }
    setHoldProgress(0)
  }, [holdTimer])

  if (loading || !data) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="w-8 h-8 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    )
  }

  const currentStepInfo = data.sections
    .flatMap((s) => s.steps)
    .find((s) => s.status === "current")

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <p className="text-gray-400 text-sm">
          {displayName ? `Welcome back, ${displayName}` : "Welcome back"}
        </p>
        <h1 className="text-white text-xl font-bold mt-1">Your Journey</h1>
      </div>

      {/* Scrollable path */}
      <div className="flex-1 overflow-y-auto px-6 pb-32">
        {data.sections.map((section) => (
          <SectionBanner key={section.day} section={section}>
            <div className="space-y-4">
              {section.steps.map((step, i) => {
                const position = i % 2 === 0 ? "left" : "right"

                return (
                  <div key={step.number}>
                    {/* Connecting line */}
                    {i > 0 && (
                      <div className="flex justify-center -mt-2 -mb-2">
                        <div
                          className="w-px h-6"
                          style={{
                            background: step.status === "locked"
                              ? "rgba(75,85,99,0.3)"
                              : "rgba(255,212,26,0.2)",
                          }}
                        />
                      </div>
                    )}

                    <div className={`flex ${position === "right" ? "justify-end" : "justify-start"}`}>
                      {step.status === "current" ? (
                        // Current step: hold-to-start orb
                        <div
                          className="relative"
                          onMouseDown={handleHoldStart}
                          onMouseUp={handleHoldEnd}
                          onMouseLeave={handleHoldEnd}
                          onTouchStart={handleHoldStart}
                          onTouchEnd={handleHoldEnd}
                        >
                          <StepNode step={step} position={position} onTap={handleStepTap} />
                          {/* Hold progress ring */}
                          {holdProgress > 0 && (
                            <svg
                              className="absolute -inset-2 z-10 pointer-events-none"
                              viewBox="0 0 56 56"
                            >
                              <circle
                                cx="28"
                                cy="28"
                                r="24"
                                fill="none"
                                stroke="rgba(255,212,26,0.5)"
                                strokeWidth="3"
                                strokeDasharray={`${2 * Math.PI * 24}`}
                                strokeDashoffset={`${2 * Math.PI * 24 * (1 - holdProgress / 100)}`}
                                strokeLinecap="round"
                                transform="rotate(-90 28 28)"
                                className="transition-all duration-100"
                              />
                            </svg>
                          )}
                          <p className="text-xs text-gray-500 mt-1 text-center">
                            Hold to start
                          </p>
                        </div>
                      ) : (
                        <StepNode step={step} position={position} onTap={handleStepTap} />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </SectionBanner>
        ))}
      </div>

      {/* Step summary sheet */}
      <StepSummarySheet
        step={selectedStep}
        onClose={() => setSelectedStep(null)}
      />
    </div>
  )
}
