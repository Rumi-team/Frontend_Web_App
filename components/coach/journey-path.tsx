"use client"

import { useState, useCallback, useEffect } from "react"
import { useStepProgress, type StepInfo } from "@/hooks/use-step-progress"
import { SectionBanner } from "./section-banner"
import { StepNode } from "./step-node"
import { StepSummarySheet } from "./step-summary-sheet"

interface JourneyPathProps {
  displayName?: string | null
  onStartSession: () => void
}

export function JourneyPath({ displayName, onStartSession }: JourneyPathProps) {
  const { data, loading, error, refresh } = useStepProgress()
  const [selectedStep, setSelectedStep] = useState<StepInfo | null>(null)

  // Teaching mode toggle (persisted in localStorage)
  const [teachingMode, setTeachingMode] = useState(true)
  useEffect(() => {
    const stored = localStorage.getItem("rumi_teaching_mode")
    if (stored !== null) setTeachingMode(stored === "true")
  }, [])
  const toggleTeachingMode = useCallback(() => {
    setTeachingMode(prev => {
      const next = !prev
      localStorage.setItem("rumi_teaching_mode", String(next))
      return next
    })
  }, [])
  const [holdProgress, setHoldProgress] = useState(0)
  const [holdTimer, setHoldTimer] = useState<ReturnType<typeof setInterval> | null>(null)

  const handleStepTap = useCallback((step: StepInfo) => {
    // All steps open the detail sheet (completed shows summary, locked shows preview + lock message)
    setSelectedStep(step)
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

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="w-8 h-8 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    )
  }

  // Fallback: if progress API fails, still let the user start a session
  if (!data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
        <p className="text-gray-400 text-sm">
          {displayName ? `Welcome back, ${displayName}` : "Welcome"}
        </p>
        <button
          onClick={onStartSession}
          className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-semibold rounded-full"
        >
          Start Session
        </button>
        {error && (
          <button onClick={refresh} className="text-gray-500 text-xs hover:text-gray-300">
            Retry loading progress
          </button>
        )}
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
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-400 text-sm">
              {displayName ? `Welcome back, ${displayName}` : "Welcome back"}
            </p>
            <h1 className="text-white text-xl font-bold mt-1">Your Journey</h1>
          </div>

          {/* Teaching mode toggle */}
          <button
            onClick={toggleTeachingMode}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-xs font-medium"
            style={{
              borderColor: teachingMode ? "rgba(59,130,246,0.5)" : "rgba(107,114,128,0.3)",
              background: teachingMode ? "rgba(59,130,246,0.1)" : "transparent",
              color: teachingMode ? "rgb(147,197,253)" : "rgb(156,163,175)",
            }}
            aria-label={`Visual teaching: ${teachingMode ? "on" : "off"}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
              <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
            </svg>
            Visual Teaching {teachingMode ? "ON" : "OFF"}
          </button>
        </div>
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
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault()
                              onStartSession()
                            }
                          }}
                          tabIndex={0}
                          role="button"
                          aria-label={`Start session: ${currentStepInfo?.concept || "next step"}. Hold to begin.`}
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
        onStartSession={onStartSession}
      />
    </div>
  )
}
