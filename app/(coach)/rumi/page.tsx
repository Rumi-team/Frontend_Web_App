"use client"

import { useState, useCallback, useEffect } from "react"
import { useLiveKitConnection } from "@/hooks/use-livekit-connection"
import { useMicrophonePermission } from "@/hooks/use-microphone-permission"
import { useLyricsManager } from "@/hooks/use-lyrics-manager"
import { useAuth } from "@/components/auth-provider"
import { CoachingSession } from "@/components/coach/coaching-session"
import { ConnectionError } from "@/components/coach/connection-error"
import { StartView } from "@/components/coach/start-view"
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

  // E2E-only state: skip LiveKit, show text-only coaching UI
  const [e2eConnected, setE2EConnected] = useState(false)
  const [e2eMessages, setE2EMessages] = useState<E2EMessage[]>([
    { role: "agent", text: "E2E mode active. Auth and mic bypassed. Type a message below." },
  ])

  // Auto-start music on first user interaction (browsers block autoplay)
  useEffect(() => {
    const startOnInteraction = () => {
      lyrics.start()
      document.removeEventListener("pointerdown", startOnInteraction)
      document.removeEventListener("keydown", startOnInteraction)
    }
    document.addEventListener("pointerdown", startOnInteraction, { once: true })
    document.addEventListener("keydown", startOnInteraction, { once: true })
    // Also try immediately (works if user already interacted with the page)
    lyrics.start()
    return () => {
      document.removeEventListener("pointerdown", startOnInteraction)
      document.removeEventListener("keydown", startOnInteraction)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
            className="text-gray-400 text-xs hover:text-white transition-colors"
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

  // Connected — show coaching session
  if (lk.connectionState === "connected" && lk.room) {
    return (
      <div className="h-dvh">
        <CoachingSession
          room={lk.room}
          isMicrophoneEnabled={lk.isMicrophoneEnabled}
          onToggleMic={lk.toggleMicrophone}
          onDisconnect={lk.disconnect}
          remoteAudioTrack={lk.remoteAudioTrack}
        />
      </div>
    )
  }

  // Error state
  if (error) {
    const isMicError = mic.hasPermission === false
    return (
      <div className="flex h-dvh items-center justify-center px-4" style={{ background: "rgb(15, 18, 23)" }}>
        <ConnectionError message={error} onRetry={handleStart} isMicError={isMicError} permissionState={mic.permissionState} />
      </div>
    )
  }

  // Disconnected — show StartView with sun orb
  return (
    <div className="h-dvh">
      <StartView
        onStartSession={handleStart}
        displayName={displayName}
        userEmail={userEmail}
        authProvider={authProvider}
        onOpenLibrary={() => setShowLibrary(true)}
        onOpenAssignments={() => setShowAssignments(true)}
        onSignOut={signOut}
        isMusicPlaying={lyrics.isMusicPlaying}
        onToggleMusic={lyrics.toggleMusic}
        lyricsLine={lyrics.currentLine}
        lyricsOpacity={lyrics.lyricOpacity}
        isConnecting={lk.connectionState === "connecting"}
      />

      {/* Library sheet overlay */}
      <LibrarySheet
        isOpen={showLibrary}
        onClose={() => setShowLibrary(false)}
        providerUserId={providerUserId}
        displayName={displayName}
      />

      {/* Assignments sheet overlay */}
      <AssignmentsSheet
        isOpen={showAssignments}
        onClose={() => setShowAssignments(false)}
        providerUserId={providerUserId}
      />
    </div>
  )
}
