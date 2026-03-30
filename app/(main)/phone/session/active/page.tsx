"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useLiveKitConnection } from "@/hooks/use-livekit-connection"
import { useMicrophonePermission } from "@/hooks/use-microphone-permission"
import { useLyricsManager } from "@/hooks/use-lyrics-manager"
import { useAuth } from "@/components/auth-provider"
import { useSessionStore } from "@/store/sessionStore"
import { useUserStore } from "@/store/userStore"
import { CoachingSession } from "@/components/coach/coaching-session"
import { FeedbackOverlay } from "@/components/coach/feedback-overlay"
import { ConnectionError } from "@/components/coach/connection-error"
import { Loader2 } from "lucide-react"

const isE2ETesting =
  process.env.NEXT_PUBLIC_E2E_TESTING === "true" &&
  process.env.NODE_ENV === "development"

export default function ActiveSessionPage() {
  const router = useRouter()
  const { displayName } = useAuth()
  const mic = useMicrophonePermission()
  const lk = useLiveKitConnection()
  const lyrics = useLyricsManager()
  const endSession = useSessionStore((s) => s.endSession)
  const updateStreak = useUserStore((s) => s.updateStreak)
  const incrementSessionsCompleted = useUserStore((s) => s.incrementSessionsCompleted)

  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackSessionId, setFeedbackSessionId] = useState("unknown")
  const [feedbackDone, setFeedbackDone] = useState(false)
  const [hadActiveSession, setHadActiveSession] = useState(false)
  const sessionStartTimeRef = useRef<number>(Date.now())
  const MIN_SESSION_FOR_FEEDBACK = 30_000

  // Auto-connect on mount
  useEffect(() => {
    if (isE2ETesting) return
    if (lk.connectionState === "disconnected") {
      lyrics.stop()
      const teachingMode = localStorage.getItem("rumi_teaching_mode") !== "false"
      mic.requestPermission().then((granted) => {
        if (granted) {
          lk.connect(displayName ?? undefined, { teaching_mode: teachingMode })
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Track session start
  useEffect(() => {
    if (lk.connectionState === "connected" && lk.room) {
      setHadActiveSession(true)
      sessionStartTimeRef.current = Date.now()
      setFeedbackSessionId(lk.room.name || "unknown")
    }
  }, [lk.connectionState, lk.room])

  // Handle disconnect
  useEffect(() => {
    if (lk.connectionState === "disconnected" && hadActiveSession && !showFeedback) {
      setHadActiveSession(false)
      const duration = Date.now() - sessionStartTimeRef.current
      if (duration >= MIN_SESSION_FOR_FEEDBACK) {
        setShowFeedback(true)
      } else {
        handleEndCleanup()
      }
    }
    if (lk.connectionState === "disconnected" && feedbackDone) {
      setFeedbackDone(false)
      handleEndCleanup()
    }
  }, [lk.connectionState, hadActiveSession, showFeedback, feedbackDone])

  const handleEndCleanup = useCallback(() => {
    const duration = Date.now() - sessionStartTimeRef.current
    if (duration >= 60_000) {
      updateStreak()
      incrementSessionsCompleted()
    }
    endSession()
    router.replace("/phone")
  }, [updateStreak, incrementSessionsCompleted, endSession, router])

  const handleRequestFeedback = useCallback((sessionId: string) => {
    setHadActiveSession(false)
    setFeedbackSessionId(sessionId)
    setShowFeedback(true)
  }, [])

  const handleFeedbackComplete = useCallback(() => {
    setShowFeedback(false)
    if (lk.connectionState === "disconnected") {
      handleEndCleanup()
      return
    }
    setFeedbackDone(true)
  }, [lk.connectionState, handleEndCleanup])

  const handleSessionComplete = useCallback(() => {
    lk.forceDisconnect()
  }, [lk])

  const handlePause = useCallback(() => {
    useSessionStore.getState().pauseSession()
    lk.forceDisconnect()
    router.replace("/phone/session/paused")
  }, [lk, router])

  const error = lk.error || mic.error
  const isMicError = mic.hasPermission === false

  return (
    <>
      <div className="relative h-dvh" style={{ background: "rgb(15, 18, 23)" }}>
        {/* Connected session */}
        {lk.connectionState === "connected" && lk.room && (
          <CoachingSession
            room={lk.room}
            isMicrophoneEnabled={lk.isMicrophoneEnabled}
            onToggleMic={lk.toggleMicrophone}
            onDisconnect={lk.disconnect}
            onRequestFeedback={handleRequestFeedback}
            onSessionComplete={handleSessionComplete}
            feedbackDone={feedbackDone}
            remoteAudioTrack={lk.remoteAudioTrack}
          />
        )}

        {/* Connecting state */}
        {lk.connectionState === "connecting" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
            <div className="w-16 h-16 rounded-full overflow-hidden mb-4 animate-pulse">
              <img src="/rumi_mascot.png" alt="Rumi" className="w-full h-full object-cover" />
            </div>
            <p className="text-gray-400 text-sm animate-pulse">Connecting to Rumi...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center px-4 z-20">
            <ConnectionError
              message={error}
              onRetry={() => {
                const teachingMode = localStorage.getItem("rumi_teaching_mode") !== "false"
                mic.requestPermission().then((granted) => {
                  if (granted) lk.connect(displayName ?? undefined, { teaching_mode: teachingMode })
                })
              }}
              isMicError={isMicError}
              permissionState={mic.permissionState}
            />
          </div>
        )}
      </div>

      {/* Feedback overlay */}
      {showFeedback && (
        <FeedbackOverlay
          sessionId={feedbackSessionId}
          onComplete={handleFeedbackComplete}
        />
      )}
    </>
  )
}
