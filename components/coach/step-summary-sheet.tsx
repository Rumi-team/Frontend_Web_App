"use client"

import type { StepInfo } from "@/hooks/use-step-progress"

// Concept descriptions for all 20 steps (matches STEP_NAMES in agent.py)
const STEP_DESCRIPTIONS: Record<number, string> = {
  1: "An introduction to the coaching journey. You'll set the intention for transformation and explore what it means to see yourself differently.",
  2: "Discover the invisible filters you see the world through. These unconscious assumptions color every interaction before you even notice.",
  3: "Like water to a fish, your context is invisible but determines what feels possible and impossible. Find the assumption governing your life.",
  4: "Learn to separate raw facts from the stories you tell about them. Most of what you call 'reality' is interpretation.",
  5: "Uncover the secret benefit you get from keeping a problem. Usually it's being 'right' about something at the cost of happiness.",
  6: "Shift from possibility as 'maybe someday' to possibility as something that transforms who you are right now.",
  7: "What if your personality is something you built as a child and forgot you built? Explore the constructed nature of identity.",
  8: "The meta-skill of making invisible patterns visible. Every new distinction opens a world that was previously hidden.",
  9: "Examine your relationship with fear and how it shapes the decisions you make and avoid.",
  10: "Go back to the childhood moment where you made a decision about who you needed to be to survive. That decision runs you now.",
  11: "See past events without the story attached. Let them be complete so they stop constraining your present.",
  12: "The scariest and most liberating step. When all stories are seen through, what remains is pure creative potential.",
  13: "Language doesn't just describe reality, it creates it. Learn to use declarations as a generative act.",
  14: "Create a new possibility from nothing. Not improving the old, but inventing something entirely new.",
  15: "Make a powerful declaration that speaks a new future into existence. This is the culmination of the transformation.",
  16: "Take your transformation into daily life. Practice living from the new context you've created.",
  17: "Notice when old patterns reassert themselves. Catching them is the skill that makes transformation permanent.",
  18: "Transform breakdowns into breakthroughs. Every obstacle becomes fuel for growth.",
  19: "Reflect on what you can now see that was invisible before. The world literally looks different.",
  20: "Share your transformation with others. Transformation spreads through authentic relating.",
}

interface StepSummarySheetProps {
  step: StepInfo | null
  onClose: () => void
  onStartSession?: () => void
}

export function StepSummarySheet({ step, onClose, onStartSession }: StepSummarySheetProps) {
  if (!step) return null

  const description = STEP_DESCRIPTIONS[step.number] || ""
  const isLocked = step.status === "locked"
  const isCompleted = step.status === "completed"
  const isCurrent = step.status === "current"

  // Find what step needs to be completed first (previous step)
  const previousStep = step.number > 1 ? step.number - 1 : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Sheet */}
      <div
        className="relative w-full max-w-lg bg-gray-900 rounded-t-2xl p-6 pb-8"
        style={{ animation: "slideUp 0.3s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-4" />

        <div className="flex items-start gap-4">
          {/* Status badge */}
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
            ${isCompleted
              ? "bg-gradient-to-br from-yellow-500 to-amber-600"
              : isLocked
                ? "bg-gray-800 border border-gray-700"
                : "bg-gradient-to-br from-yellow-400 to-amber-500"
            }
          `}>
            {isCompleted ? (
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path d="M3 8L6.5 11.5L13 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : isLocked ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgb(107,114,128)" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            ) : (
              <img src="/rumi_mascot.png" alt="Current" className="w-10 h-10 rounded-full object-cover" />
            )}
          </div>

          <div className="flex-1">
            <p className={`text-xs font-semibold uppercase tracking-widest ${
              isCompleted ? "text-yellow-500" : isLocked ? "text-gray-500" : "text-yellow-400"
            }`}>
              Step {step.number} {isCompleted ? "— Completed" : isLocked ? "— Locked" : "— Up Next"}
            </p>
            <p className="text-white text-lg font-bold mt-1">
              {step.concept}
            </p>
          </div>
        </div>

        {/* Description */}
        {description && (
          <p className="text-gray-400 text-sm mt-4 leading-relaxed">
            {description}
          </p>
        )}

        {/* Completed step extras */}
        {isCompleted && (
          <div className="mt-4 space-y-2">
            {step.taught && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-[10px] text-blue-400">T</span>
                </div>
                <span className="text-blue-400">Concept taught with visual illustration</span>
              </div>
            )}
            {step.deferred && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <span className="text-[10px] text-amber-400">R</span>
                </div>
                <span className="text-amber-400">Revisited after initial deferral</span>
              </div>
            )}
          </div>
        )}

        {/* Locked step message */}
        {isLocked && previousStep && (
          <div className="mt-4 px-4 py-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <p className="text-gray-400 text-sm">
              Complete Step {previousStep} first to unlock this step.
            </p>
          </div>
        )}

        {/* Action button */}
        {isCurrent && onStartSession ? (
          <button
            onClick={() => { onClose(); onStartSession(); }}
            className="mt-6 w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-lg text-sm font-semibold"
          >
            Start Session
          </button>
        ) : (
          <button
            onClick={onClose}
            className="mt-6 w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors text-sm font-medium"
          >
            Close
          </button>
        )}
      </div>
    </div>
  )
}
