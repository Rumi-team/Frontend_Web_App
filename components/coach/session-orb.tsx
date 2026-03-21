"use client"

import { useState, useEffect, useRef } from "react"
import { type MascotMood } from "./rumi-mascot"

interface SessionOrbProps {
  currentStep: number
  totalSteps: number
  stepName: string | null
  audioTrack: MediaStreamTrack | null
  isActive: boolean
  currentDay?: number
  totalDays?: number
  isDayLocked?: boolean
  allowedStepMin?: number
  allowedStepMax?: number
  mascotMood?: MascotMood
  size?: number
}

// Compact canvas — dots stay inside viewBox
const SVG_SIZE = 290
const CENTER = SVG_SIZE / 2
const RING_RADIUS = 108
const STROKE_WIDTH = 4

export function SessionOrb({
  currentStep,
  totalSteps,
  stepName,
  audioTrack,
  isActive,
  currentDay = 1,
  totalDays = 3,
  isDayLocked = false,
  allowedStepMin = 1,
  allowedStepMax = 5,
  mascotMood = "idle",
  size = SVG_SIZE,
}: SessionOrbProps) {
  const scale = size / SVG_SIZE
  const [celebrating, setCelebrating] = useState(false)
  const prevStepRef = useRef(currentStep)

  useEffect(() => {
    if (currentStep > prevStepRef.current && prevStepRef.current > 0) {
      setCelebrating(true)
      const t = setTimeout(() => setCelebrating(false), 700)
      return () => clearTimeout(t)
    }
    prevStepRef.current = currentStep
  }, [currentStep])

  // Day-based progress
  const stepsInDay = allowedStepMax - allowedStepMin + 1
  const dayProgress = Math.max(0, Math.min(currentStep - allowedStepMin + 1, stepsInDay))
  const dayProgressFraction = stepsInDay > 0 ? dayProgress / stepsInDay : 0

  // Progress ring
  const circumference = 2 * Math.PI * RING_RADIUS
  const progressOffset = circumference * (1 - dayProgressFraction)

  // Step dots — 120-degree arc at the top, inside the SVG bounds
  const stepDots = []
  const arcStartDeg = -150
  const arcEndDeg = -30
  const arcStart = arcStartDeg * (Math.PI / 180)
  const arcEnd = arcEndDeg * (Math.PI / 180)
  const dotOrbitRadius = RING_RADIUS + 20

  for (let i = 0; i < stepsInDay; i++) {
    const angle = stepsInDay > 1
      ? arcStart + (arcEnd - arcStart) * (i / (stepsInDay - 1))
      : (arcStart + arcEnd) / 2
    const x = CENTER + dotOrbitRadius * Math.cos(angle)
    const y = CENTER + dotOrbitRadius * Math.sin(angle)
    const completed = i < dayProgress
    const isCurrent = i === dayProgress

    stepDots.push(
      <g key={i}>
        {isCurrent && !completed && (
          <circle cx={x} cy={y} r={12} fill="rgba(38,189,255,0.15)" className="animate-pulse" />
        )}
        <circle
          cx={x}
          cy={y}
          r={completed ? 7 : 6}
          fill={completed ? "url(#step-dot-gradient)" : "transparent"}
          stroke={completed ? "none" : isCurrent ? "rgba(38,189,255,0.6)" : "rgba(255,255,255,0.2)"}
          strokeWidth={isCurrent && !completed ? 2.5 : 1.5}
          className="transition-all duration-500"
        />
        {completed && (
          <path
            d={`M ${x - 3} ${y} L ${x - 1} ${y + 2.5} L ${x + 3.5} ${y - 2.5}`}
            stroke="white"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        )}
      </g>
    )
  }

  // Section indicator arcs (bottom of ring)
  const sectionArcs = []
  const totalGap = (totalDays - 1) * 4
  const arcSpan = 100
  const segmentAngle = (arcSpan - totalGap) / totalDays
  for (let d = 0; d < totalDays; d++) {
    const day = d + 1
    const isPast = day < currentDay
    const isCurrent = day === currentDay
    const startDeg = 165 + d * (segmentAngle + 4)
    const endDeg = startDeg + segmentAngle
    const startRad = (startDeg * Math.PI) / 180
    const endRad = (endDeg * Math.PI) / 180
    const innerR = RING_RADIUS - 14

    const x1 = CENTER + innerR * Math.cos(startRad)
    const y1 = CENTER + innerR * Math.sin(startRad)
    const x2 = CENTER + innerR * Math.cos(endRad)
    const y2 = CENTER + innerR * Math.sin(endRad)

    sectionArcs.push(
      <path
        key={`sec-${d}`}
        d={`M ${x1} ${y1} A ${innerR} ${innerR} 0 0 1 ${x2} ${y2}`}
        fill="none"
        stroke={isPast ? "rgba(250,204,21,0.6)" : isCurrent ? "rgba(250,204,21,0.35)" : "rgba(255,255,255,0.08)"}
        strokeWidth={isPast ? 3 : 2.5}
        strokeLinecap="round"
        className="transition-all duration-500"
      />
    )
  }

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Orb */}
      <div
        className={`relative ${celebrating ? "animate-step-celebrate" : ""}`}
        style={{ width: size, height: size }}
      >
        {celebrating && (
          <div
            className="absolute inset-0 rounded-full animate-step-glow"
            style={{ background: "radial-gradient(circle, rgba(38,189,255,0.3) 0%, transparent 70%)" }}
          />
        )}

        {/* Ambient glow */}
        <div
          className="absolute rounded-full"
          style={{
            width: (RING_RADIUS * 2 + 40) * scale,
            height: (RING_RADIUS * 2 + 40) * scale,
            left: (CENTER - RING_RADIUS - 20) * scale,
            top: (CENTER - RING_RADIUS - 20) * scale,
            background: "radial-gradient(circle, rgba(38,189,255,0.05) 0%, transparent 70%)",
          }}
        />

        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          className="relative z-10"
        >
          <defs>
            <linearGradient id="step-dot-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgb(38,189,255)" />
              <stop offset="100%" stopColor="rgb(31,117,242)" />
            </linearGradient>
            <linearGradient id="ring-progress-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(38,189,255,0.9)" />
              <stop offset="100%" stopColor="rgba(31,117,242,0.5)" />
            </linearGradient>
          </defs>

          {/* Background ring */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RING_RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={STROKE_WIDTH}
          />

          {/* Progress ring */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RING_RADIUS}
            fill="none"
            stroke="url(#ring-progress-gradient)"
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={progressOffset}
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
            className="transition-all duration-700 ease-out"
          />

          {/* Section indicator arcs */}
          {sectionArcs}

          {/* Step dots */}
          {stepDots}
        </svg>

        {/* Mascot at center of orb */}
        <div
          className="absolute z-20 rounded-full overflow-hidden"
          style={{
            width: RING_RADIUS * 1.4 * scale,
            height: RING_RADIUS * 1.4 * scale,
            left: (CENTER - RING_RADIUS * 0.7) * scale,
            top: (CENTER - RING_RADIUS * 0.7) * scale,
          }}
        >
          <img
            src="/rumi_mascot.png"
            alt="Rumi"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Step name */}
      {stepName && (
        <p
          className="font-bold text-center leading-tight"
          style={{
            color: "rgb(255, 212, 26)",
            fontSize: Math.max(14, Math.round(24 * scale)),
            maxWidth: size * 1.2,
          }}
        >
          {stepName}
        </p>
      )}

      {/* Section + step counter */}
      <p className="text-lg text-gray-400 font-semibold tracking-wide">
        Section {currentDay} &mdash; Step {dayProgress} of {stepsInDay}
      </p>
    </div>
  )
}
