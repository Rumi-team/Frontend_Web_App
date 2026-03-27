"use client"

import type { StepInfo } from "@/hooks/use-step-progress"

interface StepSummarySheetProps {
  step: StepInfo | null
  onClose: () => void
}

export function StepSummarySheet({ step, onClose }: StepSummarySheetProps) {
  if (!step) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Sheet */}
      <div
        className="relative w-full max-w-lg bg-gray-900 rounded-t-2xl p-6 pb-8 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-4" />

        <div className="flex items-start gap-4">
          {/* Completed badge */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8L6.5 11.5L13 5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div>
            <p className="text-yellow-500 text-xs font-semibold uppercase tracking-widest">
              Step {step.number} — Completed
            </p>
            <p className="text-white text-lg font-bold mt-1">
              {step.concept}
            </p>
            {step.taught && (
              <p className="text-blue-400 text-sm mt-2">
                Concept taught with visual illustration
              </p>
            )}
            {step.deferred && (
              <p className="text-amber-400 text-sm mt-1">
                This step was revisited after deferral
              </p>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors text-sm font-medium"
        >
          Close
        </button>
      </div>
    </div>
  )
}
