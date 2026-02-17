"use client"

import { useEffect, useState } from "react"
import { CheckCircle2 } from "lucide-react"

interface SessionSaveOverlayProps {
  progress: number
  stage: string | null
  onComplete: () => void
}

const STAGE_LABELS: Record<string, string> = {
  starting: "Preparing session data...",
  memory_saving: "Saving to memory...",
  memory_added: "Rumi is memorizing this session...",
  summary_generating: "Generating summary...",
  summary_generated: "Generating summary...",
  summary_saved: "Summary saved...",
  evaluating_progress: "Evaluating your progress...",
  evaluation_saved: "Evaluation saved...",
  database_saving: "Saving to database...",
  complete: "Session saved!",
}

export function SessionSaveOverlay({
  progress,
  stage,
  onComplete,
}: SessionSaveOverlayProps) {
  const [isComplete, setIsComplete] = useState(false)
  const label = stage ? STAGE_LABELS[stage] ?? stage : "Saving..."

  useEffect(() => {
    if (stage === "complete") {
      setIsComplete(true)
      const timer = setTimeout(onComplete, 2000)
      return () => clearTimeout(timer)
    }
  }, [stage, onComplete])

  const pct = Math.round(progress)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 px-8 text-center">
        {isComplete ? (
          <CheckCircle2 className="h-16 w-16 text-green-400" />
        ) : (
          <AnimatedHourglass progress={progress / 100} />
        )}

        <p className="text-lg text-white">{label}</p>

        {!isComplete && (
          <p className="text-sm text-gray-500">{pct}%</p>
        )}

        {/* Progress bar */}
        <div className="w-64 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              background: isComplete
                ? "rgb(74,222,128)"
                : "rgb(250,204,21)",
            }}
          />
        </div>
      </div>
    </div>
  )
}

/* ---------- Animated SVG Hourglass ---------- */

function AnimatedHourglass({ progress }: { progress: number }) {
  const topFill = 1.0 - progress
  const bottomFill = progress
  const size = 64

  return (
    <div className="relative animate-hourglass-glow">
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Hourglass frame */}
        <path
          d="M16 8h32v0c0 10-8 18-16 24c8 6 16 14 16 24v0H16v0c0-10 8-18 16-24c-8-6-16-14-16-24v0z"
          stroke="rgba(250,204,21,0.6)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Top sand */}
        <clipPath id="top-clip">
          <rect x="16" y="8" width="32" height="24" />
        </clipPath>
        <rect
          x="16"
          y={8 + 24 * (1 - topFill)}
          width="32"
          height={24 * topFill}
          fill="rgba(250,204,21,0.3)"
          clipPath="url(#top-clip)"
          className="transition-all duration-500"
        />

        {/* Bottom sand */}
        <clipPath id="bottom-clip">
          <rect x="16" y="32" width="32" height="24" />
        </clipPath>
        <rect
          x="16"
          y={56 - 24 * bottomFill}
          width="32"
          height={24 * bottomFill}
          fill="rgba(250,204,21,0.4)"
          clipPath="url(#bottom-clip)"
          className="transition-all duration-500"
        />

        {/* Falling sand particles through neck */}
        {progress > 0 && progress < 1 && (
          <>
            <circle cx="32" cy="32" r="1" fill="rgba(250,204,21,0.8)" className="animate-sand-fall-1" />
            <circle cx="31" cy="34" r="0.8" fill="rgba(250,204,21,0.6)" className="animate-sand-fall-2" />
            <circle cx="33" cy="33" r="0.8" fill="rgba(250,204,21,0.7)" className="animate-sand-fall-3" />
          </>
        )}

        {/* Top cap */}
        <line x1="14" y1="8" x2="50" y2="8" stroke="rgba(250,204,21,0.5)" strokeWidth="2" strokeLinecap="round" />
        {/* Bottom cap */}
        <line x1="14" y1="56" x2="50" y2="56" stroke="rgba(250,204,21,0.5)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  )
}
