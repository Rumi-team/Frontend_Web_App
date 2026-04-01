"use client"

import { useState, useCallback, useEffect } from "react"
import { useStepProgress, type StepInfo } from "@/hooks/use-step-progress"
import { SectionBanner } from "./section-banner"
import { StepSummarySheet } from "./step-summary-sheet"

interface JourneyPathProps {
  displayName?: string | null
  onStartSession: () => void
}

// Duolingo-style centered zigzag positions (percentage from left)
// Creates an S-curve pattern down the screen
const ZIGZAG_OFFSETS = [50, 30, 20, 35, 50] // percentages from left for 5 nodes

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

  const handleStepTap = useCallback((step: StepInfo) => {
    // All steps open the detail sheet (completed shows summary, locked shows preview + lock message)
    setSelectedStep(step)
  }, [])

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#F5C518]/30 border-t-[#F5C518] rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
        <p className="text-gray-400 text-sm">
          {displayName ? `Welcome back, ${displayName}` : "Welcome"}
        </p>
        <button
          onClick={onStartSession}
          className="px-8 py-3 bg-[#F5C518] text-[#1A1A1A] font-extrabold rounded-full uppercase tracking-wide"
          style={{ boxShadow: "0 4px 0 #C49B00", fontFamily: "var(--font-nunito, Nunito), sans-serif" }}
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

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[#9E9E9E] text-sm">
              {displayName ? `Welcome back, ${displayName}` : "Welcome back"}
            </p>
            <h1 className="text-[#F5C518] text-xl font-bold mt-1" style={{ fontFamily: "var(--font-nunito, Nunito), sans-serif" }}>Your Journey</h1>
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
      <div className="flex-1 overflow-y-auto pb-32">
        {data.sections.map((section) => (
          <SectionBanner key={section.day} section={section}>
            <div className="relative py-2">
              {section.steps.map((step, i) => {
                const leftPct = ZIGZAG_OFFSETS[i % ZIGZAG_OFFSETS.length]
                const isCurrent = step.status === "current"

                return (
                  <div key={step.number} className="relative" style={{ height: isCurrent ? 100 : 72 }}>
                    {/* Connecting dotted line to next node */}
                    {i < section.steps.length - 1 && (
                      <svg
                        className="absolute pointer-events-none"
                        style={{
                          left: `${leftPct}%`,
                          top: isCurrent ? 80 : 56,
                          width: 2,
                          height: isCurrent ? 20 : 16,
                          transform: "translateX(-1px)",
                        }}
                      >
                        <line
                          x1="1" y1="0" x2="1"
                          y2={isCurrent ? 20 : 16}
                          stroke={step.status === "locked" ? "rgba(75,85,99,0.3)" : "rgba(255,212,26,0.25)"}
                          strokeWidth="2"
                          strokeDasharray="4 4"
                        />
                      </svg>
                    )}

                    {/* Node */}
                    <div
                      className="absolute flex flex-col items-center"
                      style={{
                        left: `${leftPct}%`,
                        transform: "translateX(-50%)",
                        top: 0,
                      }}
                    >
                      {/* "START" callout for current step */}
                      {isCurrent && (
                        <div className="mb-1 animate-bounce">
                          <div className="bg-gray-700 text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-widest">
                            START
                          </div>
                          <div className="w-2 h-2 bg-gray-700 rotate-45 mx-auto -mt-1" />
                        </div>
                      )}

                      {/* Circle button */}
                      <button
                        onClick={() => handleStepTap(step)}
                        /* All steps tappable — locked shows detail sheet instead of starting */
                        className={`
                          relative rounded-full flex items-center justify-center transition-all duration-300
                          ${isCurrent
                            ? "w-14 h-14 shadow-lg shadow-yellow-500/30"
                            : step.status === "completed"
                              ? "w-12 h-12"
                              : "w-11 h-11 opacity-40"
                          }
                        `}
                        style={{
                          background: step.status === "completed"
                            ? "#4CAF50"
                            : isCurrent
                              ? "#F5C518"
                              : "rgba(55,65,81,0.5)",
                          boxShadow: isCurrent
                            ? "0 0 20px rgba(245,197,24,0.4), 0 0 40px rgba(245,197,24,0.15), 0 4px 0 #C49B00"
                            : step.status === "completed"
                              ? "0 4px 0 #388E3C"
                              : undefined,
                        }}
                        aria-label={
                          isCurrent
                            ? `Start session: ${step.concept}`
                            : step.status === "completed"
                              ? `Completed: ${step.concept}`
                              : `Locked: ${step.concept}`
                        }
                      >
                        {/* Pulsing ring for current */}
                        {isCurrent && (
                          <div className="absolute inset-0 rounded-full border-2 border-[#F5C518]/50 animate-ping" />
                        )}

                        {/* Inner content */}
                        {step.status === "completed" ? (
                          step.isMilestone ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                            </svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                              <path d="M3 8L6.5 11.5L13 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )
                        ) : isCurrent ? (
                          <img
                            src="/rumi_mascot.png"
                            alt="Current"
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : step.isMilestone ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="rgb(107,114,128)">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                          </svg>
                        ) : (
                          <div className="w-3 h-3 rounded-full bg-gray-600" />
                        )}
                      </button>

                      {/* Step name — only show for current, completed, and milestones */}
                      {(isCurrent || step.status === "completed") && (
                        <p className={`
                          mt-1 text-[11px] font-medium max-w-[100px] text-center leading-tight
                          ${isCurrent ? "text-white" : "text-yellow-500/60"}
                        `}>
                          {step.concept}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </SectionBanner>
        ))}
      </div>

      <StepSummarySheet
        step={selectedStep}
        onClose={() => setSelectedStep(null)}
        onStartSession={onStartSession}
      />
    </div>
  )
}
