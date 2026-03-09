"use client"

import { useEffect, useState } from "react"
import { CheckCircle2 } from "lucide-react"

interface SessionSaveOverlayProps {
  progress: number
  stage: string | null
  onComplete: () => void
}

const STAGE_LABELS: Record<string, string> = {
  starting: "Rumi is reflecting on your session...",
  summarizing: "Rumi is processing your insights...",
  memory_saving: "Rumi is memorizing this...",
  saving_memory: "Rumi is memorizing this...",
  memory_added: "Rumi is memorizing this session...",
  summary_generating: "Rumi is capturing the highlights...",
  summary_generated: "Rumi is capturing the highlights...",
  summary_saved: "Highlights captured...",
  evaluating_progress: "Rumi is evaluating your growth...",
  evaluation_saved: "Growth evaluation complete...",
  saving_session: "Rumi is memorizing everything...",
  database_saving: "Rumi is memorizing everything...",
  day_complete: "Section complete! See you tomorrow...",
  complete: "All memorized! ✨",
}

export function SessionSaveOverlay({
  progress,
  stage,
  onComplete,
}: SessionSaveOverlayProps) {
  const [isComplete, setIsComplete] = useState(false)
  const label = stage ? STAGE_LABELS[stage] ?? stage : "Rumi is memorizing..."

  useEffect(() => {
    if (stage === "complete") {
      setIsComplete(true)
      const timer = setTimeout(onComplete, 2000)
      return () => clearTimeout(timer)
    }
  }, [stage, onComplete])

  // Safety timeout: auto-complete if server doesn't respond within 45s
  useEffect(() => {
    if (isComplete) return
    const safety = setTimeout(() => {
      setIsComplete(true)
      setTimeout(onComplete, 1500)
    }, 45_000)
    return () => clearTimeout(safety)
  }, [isComplete, onComplete])

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

  return (
    <div className="relative animate-hourglass-glow">
      <svg
        width={80}
        height={80}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Clip path matching the hourglass interior — top half */}
          <clipPath id="hg-top">
            <path d="M16 8 H48 C48 18 40 26 32 32 C24 26 16 18 16 8 Z" />
          </clipPath>
          {/* Clip path matching the hourglass interior — bottom half */}
          <clipPath id="hg-bottom">
            <path d="M32 32 C40 38 48 46 48 56 H16 C16 46 24 38 32 32 Z" />
          </clipPath>
        </defs>

        {/* Top sand — depletes as progress grows */}
        <rect
          x="0"
          y={8 + 24 * (1 - topFill)}
          width="64"
          height={24 * topFill}
          fill="rgba(250,204,21,0.3)"
          clipPath="url(#hg-top)"
          className="transition-all duration-500"
        />

        {/* Bottom sand — fills as progress grows */}
        <rect
          x="0"
          y={56 - 24 * bottomFill}
          width="64"
          height={24 * bottomFill}
          fill="rgba(250,204,21,0.45)"
          clipPath="url(#hg-bottom)"
          className="transition-all duration-500"
        />

        {/* Sand stream through the neck */}
        {progress > 0 && progress < 1 && (
          <line
            x1="32" y1="29" x2="32" y2="36"
            stroke="rgba(250,204,21,0.7)"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <animate attributeName="opacity" values="0.3;0.9;0.3" dur="1.2s" repeatCount="indefinite" />
          </line>
        )}

        {/* Hourglass frame outline */}
        <path
          d="M16 8h32v0c0 10-8 18-16 24c8 6 16 14 16 24v0H16v0c0-10 8-18 16-24c-8-6-16-14-16-24v0z"
          stroke="rgba(250,204,21,0.6)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Top cap */}
        <line x1="14" y1="8" x2="50" y2="8" stroke="rgba(250,204,21,0.5)" strokeWidth="2.5" strokeLinecap="round" />
        {/* Bottom cap */}
        <line x1="14" y1="56" x2="50" y2="56" stroke="rgba(250,204,21,0.5)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  )
}
