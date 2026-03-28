"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useLiveKitConnection } from "@/hooks/use-livekit-connection"
import { useMicrophonePermission } from "@/hooks/use-microphone-permission"
import { useLyricsManager } from "@/hooks/use-lyrics-manager"
import { useAuth } from "@/components/auth-provider"
import { CoachingSession } from "@/components/coach/coaching-session"
import { FeedbackOverlay } from "@/components/coach/feedback-overlay"
import { ConnectionError } from "@/components/coach/connection-error"
import { StartView } from "@/components/coach/start-view"
import { JourneyPath } from "@/components/coach/journey-path"
import { LibrarySheet } from "@/components/library/library-sheet"
import { AssignmentsSheet } from "@/components/coach/assignments-sheet"
import { TextInput } from "@/components/coach/text-input"
import { Loader2 } from "lucide-react"

// E2E testing bypass — never true in production (NODE_ENV guard in each hook)
const isE2ETesting =
  process.env.NEXT_PUBLIC_E2E_TESTING === "true" &&
  process.env.NODE_ENV === "development"

interface E2EMessage {
  role: "user" | "agent"
  text: string
}

export default function CoachPage() {
  const { displayName, signOut, providerUserId, userEmail, authProvider } = useAuth()
  const mic = useMicrophonePermission()
  const lk = useLiveKitConnection()
  const lyrics = useLyricsManager()

  const [showLibrary, setShowLibrary] = useState(false)
  const [showAssignments, setShowAssignments] = useState(false)

  // Feedback overlay — kept at page level so it survives session teardown on disconnect
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackSessionId, setFeedbackSessionId] = useState("unknown")
  const [feedbackDone, setFeedbackDone] = useState(false)
  const [hadActiveSession, setHadActiveSession] = useState(false)
  const sessionStartTimeRef = useRef<number>(0)
  const MIN_SESSION_FOR_FEEDBACK = 30_000 // 30 seconds

  // E2E-only state: skip LiveKit, show text-only coaching UI
  const [e2eConnected, setE2EConnected] = useState(false)
  const [e2eMessages, setE2EMessages] = useState<E2EMessage[]>([
    { role: "agent", text: "E2E mode active. Auth and mic bypassed. Type a message below." },
  ])

  const handleStart = useCallback(async () => {
    lyrics.stop()

    // E2E mode: skip LiveKit entirely, show text-only UI
    if (isE2ETesting) {
      setE2EConnected(true)
      return
    }

    // Request mic permission first
    const granted = await mic.requestPermission()
    if (!granted) return

    await lk.connect(displayName ?? undefined)
  }, [mic, lk, displayName, lyrics])

  const handleE2ESend = useCallback(async (text: string) => {
    setE2EMessages((prev) => [
      ...prev,
      { role: "user", text },
      { role: "agent", text: `[E2E echo] ${text}` },
    ])
  }, [])

  // Save session ID and start time when connected
  useEffect(() => {
    if (lk.connectionState === "connected" && lk.room) {
      setHadActiveSession(true)
      sessionStartTimeRef.current = Date.now()
      setFeedbackSessionId(lk.room.name || "unknown")
    }
  }, [lk.connectionState, lk.room])

  // Show feedback when room disconnects, but only if session was long enough
  useEffect(() => {
    if (lk.connectionState === "disconnected" && hadActiveSession && !showFeedback) {
      setHadActiveSession(false)
      const sessionDuration = Date.now() - sessionStartTimeRef.current
      if (sessionDuration >= MIN_SESSION_FOR_FEEDBACK) {
        setShowFeedback(true)
      }
    }
    // If room disconnects after feedback was done (during save), just reset to orb
    if (lk.connectionState === "disconnected" && feedbackDone) {
      setFeedbackDone(false)
    }
  }, [lk.connectionState, hadActiveSession, showFeedback, feedbackDone])

  const handleRequestFeedback = useCallback((sessionId: string) => {
    setHadActiveSession(false)
    setFeedbackSessionId(sessionId)
    setShowFeedback(true)
  }, [])

  const handleFeedbackComplete = useCallback(() => {
    setShowFeedback(false)
    // If room already disconnected (unexpected disconnect), go straight to orb
    if (lk.connectionState === "disconnected") {
      setFeedbackDone(false)
      return
    }
    // Otherwise, signal coaching session to show save overlay then disconnect
    setFeedbackDone(true)
  }, [lk.connectionState])

  const handleSessionComplete = useCallback(() => {
    // Do NOT reset feedbackDone here — doing so would cause coaching-session's
    // end_conversation effect to re-fire onRequestFeedback while the room is
    // still connected and the component still mounted.
    // The disconnect useEffect resets feedbackDone after forceDisconnect fires.
    lk.forceDisconnect()
  }, [lk])

  const error = lk.error || mic.error

  // E2E mode: text-only coaching UI (no LiveKit)
  if (isE2ETesting && e2eConnected) {
    return (
      <div className="flex h-dvh flex-col" style={{ background: "rgb(15, 18, 23)" }}>
        {/* E2E mode banner */}
        <div className="flex items-center justify-between px-4 py-2 bg-yellow-400/10 border-b border-yellow-400/20">
          <span className="text-yellow-400 font-semibold text-xs tracking-wide uppercase">E2E Test Mode — Text Only</span>
          <button
            onClick={() => setE2EConnected(false)}
            className="text-gray-400 text-xs hover:text-white transition-colors min-h-[44px] px-2"
          >
            ← Back to Start
          </button>
        </div>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {e2eMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <span
                className={`max-w-xs px-3 py-2 rounded-xl text-sm ${
                  msg.role === "user"
                    ? "bg-yellow-400/20 text-white"
                    : "bg-gray-800 text-gray-200"
                }`}
              >
                {msg.text}
              </span>
            </div>
          ))}
        </div>
        {/* Text input */}
        <TextInput onSend={handleE2ESend} />
      </div>
    )
  }

  // Single return — FeedbackOverlay is outside all connection-state branches so it
  // never remounts when the room transitions between connected/disconnected mid-feedback.
  const isMicError = mic.hasPermission === false

  return (
    <>
      {/* Layered views with crossfade transitions */}
      <div className="relative h-dvh" style={{ background: "rgb(15, 18, 23)" }}>
        {/* Journey Path (home screen) — fades out when connecting/connected */}
        <div className={`absolute inset-0 flex flex-col transition-all duration-700 ease-in-out ${
          lk.connectionState === "disconnected" && !error
            ? "opacity-100 scale-100"
            : "opacity-0 scale-[0.97] pointer-events-none"
        }`}>
          <JourneyPath
            displayName={displayName}
            onStartSession={handleStart}
          />
          <div className="flex-shrink-0 flex items-center justify-center gap-6 px-6 pb-6 pt-2">
            <button
              onClick={() => setShowLibrary(true)}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Library
            </button>
            <button
              onClick={() => setShowAssignments(true)}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Assignments
            </button>
            <button
              onClick={signOut}
              className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Coaching session — fades in when connected */}
        <div className={`absolute inset-0 transition-all duration-700 ease-in-out ${
          lk.connectionState === "connected" && lk.room
            ? "opacity-100 scale-100"
            : "opacity-0 scale-[1.03] pointer-events-none"
        }`}>
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
        </div>

        {/* Connecting state — centered spinner while LiveKit connects */}
        {lk.connectionState === "connecting" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 animate-fade-in">
            <div className="w-16 h-16 rounded-full overflow-hidden mb-4 animate-pulse">
              <img src="/rumi_mascot.png" alt="Rumi" className="w-full h-full object-cover" />
            </div>
            <p className="text-gray-400 text-sm animate-pulse">Connecting to Rumi...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center px-4 z-20">
            <ConnectionError message={error} onRetry={handleStart} isMicError={isMicError} permissionState={mic.permissionState} />
          </div>
        )}
      </div>
      )}

      {/* Library and assignments sheets — always mounted, controlled by open state */}
      <LibrarySheet
        isOpen={showLibrary}
        onClose={() => setShowLibrary(false)}
        providerUserId={providerUserId}
        displayName={displayName}
      />
      <AssignmentsSheet
        isOpen={showAssignments}
        onClose={() => setShowAssignments(false)}
        providerUserId={providerUserId}
      />

      {/* Feedback overlay — single stable instance, survives all connection-state transitions */}
      {showFeedback && (
        <FeedbackOverlay
          sessionId={feedbackSessionId}
          onComplete={handleFeedbackComplete}
        />
      )}
    </>
  )
}
