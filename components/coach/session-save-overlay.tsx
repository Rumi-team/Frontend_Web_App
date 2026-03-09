"use client"

import { useEffect, useRef, useState } from "react"

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
  complete: "All memorized!",
}

export function SessionSaveOverlay({
  progress,
  stage,
  onComplete,
}: SessionSaveOverlayProps) {
  const [isComplete, setIsComplete] = useState(false)
  const [displayProgress, setDisplayProgress] = useState(2) // Start at 2% immediately
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const serverProgressRef = useRef(0)
  const label = stage ? STAGE_LABELS[stage] ?? stage : "Rumi is memorizing..."

  // Track server progress in a ref to avoid stale closures
  useEffect(() => {
    if (progress > 0) {
      serverProgressRef.current = progress
      setDisplayProgress((prev) => Math.max(prev, progress))
    }
  }, [progress])

  // Client-side interpolation: starts on mount, creeps forward so bar is always moving
  useEffect(() => {
    if (isComplete) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      setDisplayProgress((prev) => {
        if (prev >= 95) return prev
        // Slow down as progress increases
        const increment = prev < 20 ? 1.5 : prev < 50 ? 1.0 : prev < 80 ? 0.5 : 0.2
        const next = prev + increment
        // Don't overshoot server progress by too much
        const server = serverProgressRef.current
        const ceiling = server > 0 ? Math.max(server + 20, 95) : 95
        return Math.min(next, ceiling)
      })
    }, 600)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isComplete])

  useEffect(() => {
    if (stage === "complete") {
      setDisplayProgress(100)
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
      setDisplayProgress(100)
      setTimeout(onComplete, 1500)
    }, 45_000)
    return () => clearTimeout(safety)
  }, [isComplete, onComplete])

  const pct = Math.round(displayProgress)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 px-8 text-center">
        {/* Mascot video / completed state */}
        <div className="relative">
          {isComplete ? (
            <>
              {/* Completed: static mascot image with golden ring + sparkles */}
              <img
                src="/rumi_mascot.png"
                alt="Rumi mascot"
                className="w-32 h-32 rounded-full object-cover"
              />
              <div className="absolute inset-[-8px] rounded-full border-2 border-yellow-400 shadow-[0_0_30px_rgba(255,210,50,0.6)]" />
              {/* Sparkle particles */}
              <div className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-300 rounded-full animate-ping" />
              <div className="absolute -bottom-1 -left-3 w-2 h-2 bg-yellow-200 rounded-full animate-ping [animation-delay:150ms]" />
              <div className="absolute top-1/2 -right-4 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping [animation-delay:300ms]" />
            </>
          ) : (
            <>
              {/* Saving: looping mascot video with pulsing golden glow ring */}
              <video
                className="w-32 h-32 rounded-full object-cover"
                src="/videos/mascot-intro.mp4"
                autoPlay
                loop
                muted
                playsInline
              />
              <div className="absolute inset-[-8px] rounded-full border-2 border-yellow-400/30 animate-pulse shadow-[0_0_20px_rgba(255,210,50,0.3)]" />
            </>
          )}
        </div>

        {/* Stage label */}
        <p className={
          isComplete
            ? "text-xl font-semibold text-yellow-400"
            : "text-lg text-white"
        }>
          {label}
        </p>

        {/* Bouncing dots while saving */}
        {!isComplete && (
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}

        {/* Progress percentage */}
        {!isComplete && (
          <p className="text-sm text-gray-500">{pct}%</p>
        )}

        {/* Progress bar with gold gradient */}
        <div className="w-64 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${displayProgress}%`,
              background: isComplete
                ? "linear-gradient(90deg, rgb(250,204,21), rgb(255,210,50))"
                : "linear-gradient(90deg, rgb(250,204,21), rgb(255,160,0))",
            }}
          />
        </div>
      </div>
    </div>
  )
}
