"use client"

import { useState, useEffect, useRef } from "react"
import { AudioVisualizer } from "./audio-visualizer"

interface SessionOrbProps {
  currentStep: number
  totalSteps: number
  stepName: string | null
  audioTrack: MediaStreamTrack | null
  isActive: boolean
}

const ORB_SIZE = 200
const STROKE_WIDTH = 4
const RADIUS = (ORB_SIZE - STROKE_WIDTH) / 2
const CENTER = ORB_SIZE / 2

export function SessionOrb({
  currentStep,
  totalSteps,
  stepName,
  audioTrack,
  isActive,
}: SessionOrbProps) {
  const [celebrating, setCelebrating] = useState(false)
  const prevStepRef = useRef(currentStep)

  // Celebrate when step advances
  useEffect(() => {
    if (currentStep > prevStepRef.current && prevStepRef.current > 0) {
      setCelebrating(true)
      const t = setTimeout(() => setCelebrating(false), 700)
      return () => clearTimeout(t)
    }
    prevStepRef.current = currentStep
  }, [currentStep])

  // Progress ring
  const circumference = 2 * Math.PI * RADIUS
  const progress = totalSteps > 0 ? currentStep / totalSteps : 0
  const progressOffset = circumference * (1 - progress)

  // Step dots: arrange in 120-degree arc at top
  const stepDots = []
  const arcStart = -140 * (Math.PI / 180) // -140 degrees
  const arcEnd = -40 * (Math.PI / 180)    // -40 degrees
  const dotRadius = RADIUS + 16

  for (let i = 0; i < totalSteps; i++) {
    const angle = totalSteps > 1
      ? arcStart + (arcEnd - arcStart) * (i / (totalSteps - 1))
      : (arcStart + arcEnd) / 2
    const x = CENTER + dotRadius * Math.cos(angle)
    const y = CENTER + dotRadius * Math.sin(angle)
    const completed = i < currentStep

    stepDots.push(
      <circle
        key={i}
        cx={x}
        cy={y}
        r={5}
        fill={completed ? "url(#step-gradient)" : "transparent"}
        stroke={completed ? "none" : "rgba(255,255,255,0.3)"}
        strokeWidth={1.5}
        className="transition-all duration-300"
      />
    )
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`relative ${celebrating ? "animate-step-celebrate" : ""}`}
        style={{ width: ORB_SIZE, height: ORB_SIZE }}
      >
        {/* Celebration glow */}
        {celebrating && (
          <div
            className="absolute inset-0 rounded-full animate-step-glow"
            style={{
              background: "radial-gradient(circle, rgba(38,189,255,0.3) 0%, transparent 70%)",
            }}
          />
        )}

        <svg
          width={ORB_SIZE}
          height={ORB_SIZE}
          viewBox={`0 0 ${ORB_SIZE} ${ORB_SIZE}`}
          className="relative z-10"
        >
          <defs>
            <linearGradient id="step-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgb(38,189,255)" />
              <stop offset="100%" stopColor="rgb(31,117,242)" />
            </linearGradient>
            <linearGradient id="ring-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(38,189,255,0.8)" />
              <stop offset="100%" stopColor="rgba(31,117,242,0.4)" />
            </linearGradient>
          </defs>

          {/* Background ring */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={STROKE_WIDTH}
          />

          {/* Progress ring */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="url(#ring-gradient)"
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={progressOffset}
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
            className="transition-all duration-500"
          />

          {/* Step dots */}
          {stepDots}
        </svg>

        {/* Center: audio visualizer */}
        {audioTrack && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <AudioVisualizer audioTrack={audioTrack} />
          </div>
        )}
      </div>

      {/* Step name */}
      {stepName && (
        <p
          className="text-sm font-medium text-center max-w-[200px]"
          style={{ color: "rgb(255, 212, 26)" }}
        >
          {stepName}
        </p>
      )}

      {/* Step count */}
      <p className="text-xs text-gray-500">
        Step {currentStep} of {totalSteps}
      </p>
    </div>
  )
}
