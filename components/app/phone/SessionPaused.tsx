"use client"

import { useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSessionStore } from "@/store/sessionStore"
import { useUserStore } from "@/store/userStore"
import { Pause, Play, X } from "lucide-react"

export function SessionPaused() {
  const router = useRouter()
  const timeRemaining = useSessionStore((s) => s.timeRemaining)
  const tickTimer = useSessionStore((s) => s.tickTimer)
  const resumeSession = useSessionStore((s) => s.resumeSession)
  const endSession = useSessionStore((s) => s.endSession)
  const updateStreak = useUserStore((s) => s.updateStreak)
  const incrementSessionsCompleted = useUserStore((s) => s.incrementSessionsCompleted)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const handleEnd = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    updateStreak()
    incrementSessionsCompleted()
    endSession()
    router.replace("/phone")
  }, [updateStreak, incrementSessionsCompleted, endSession, router])

  const handleResume = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    resumeSession()
    router.replace("/phone/session/active")
  }, [resumeSession, router])

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const remaining = useSessionStore.getState().timeRemaining
      if (remaining <= 1) {
        handleEnd()
      } else {
        tickTimer()
      }
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [tickTimer, handleEnd])

  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60

  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-8" style={{ background: "#FAF5EF" }}>
      <Pause className="h-12 w-12 text-gray-400" />

      <div className="text-center">
        <p className="text-sm text-gray-500 mb-2">Session Paused</p>
        <p className="text-5xl font-light text-gray-800 tabular-nums">
          {minutes}:{seconds.toString().padStart(2, "0")}
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleResume}
          className="flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 text-white text-sm font-medium shadow-lg hover:bg-green-700 transition-colors"
        >
          <Play className="h-4 w-4" />
          Resume
        </button>
        <button
          onClick={handleEnd}
          className="flex items-center gap-2 rounded-full bg-gray-200 px-6 py-3 text-gray-700 text-sm font-medium hover:bg-gray-300 transition-colors"
        >
          <X className="h-4 w-4" />
          End Session
        </button>
      </div>
    </div>
  )
}
