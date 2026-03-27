"use client"

import type { StepInfo } from "@/hooks/use-step-progress"

interface StepNodeProps {
  step: StepInfo
  position: "left" | "right"
  onTap: (step: StepInfo) => void
}

export function StepNode({ step, position, onTap }: StepNodeProps) {
  const isCompleted = step.status === "completed"
  const isCurrent = step.status === "current"
  const isLocked = step.status === "locked"

  return (
    <button
      onClick={() => onTap(step)}
      className={`
        flex items-center gap-3 group
        ${position === "right" ? "flex-row-reverse text-right" : ""}
      `}
      disabled={isLocked}
    >
      {/* Node circle */}
      <div className="relative flex-shrink-0">
        {/* Pulsing glow for current step */}
        {isCurrent && (
          <div
            className="absolute inset-0 rounded-full animate-pulse"
            style={{
              width: 52,
              height: 52,
              left: -6,
              top: -6,
              background: "radial-gradient(circle, rgba(255,212,26,0.3) 0%, transparent 70%)",
            }}
          />
        )}

        <div
          className={`
            relative w-10 h-10 rounded-full flex items-center justify-center
            transition-all duration-300
            ${isCompleted
              ? "bg-gradient-to-br from-yellow-500 to-amber-600 shadow-lg shadow-yellow-500/20"
              : isCurrent
                ? "bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-yellow-500/30"
                : "bg-gray-800/60 border border-gray-700/50"
            }
            ${step.isMilestone ? "w-12 h-12" : ""}
          `}
          style={isLocked ? { opacity: 0.4 } : undefined}
        >
          {isCompleted && !step.isMilestone && (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8L6.5 11.5L13 5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          {step.isMilestone && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill={isCompleted ? "white" : isLocked ? "rgb(75,85,99)" : "rgb(255,212,26)"}
                stroke="none"
              />
            </svg>
          )}
          {isCurrent && !step.isMilestone && (
            <img
              src="/rumi_mascot.png"
              alt="Current step"
              className="w-8 h-8 rounded-full object-cover"
            />
          )}
        </div>

        {/* Teaching badge */}
        {step.taught && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-[8px] text-white">T</span>
          </div>
        )}
      </div>

      {/* Step label */}
      <span
        className={`
          text-sm font-medium transition-colors
          ${isCompleted ? "text-yellow-500/80" : isCurrent ? "text-white" : "text-gray-600"}
        `}
      >
        {step.concept}
      </span>
    </button>
  )
}
