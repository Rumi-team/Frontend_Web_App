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
import { Loader2 } from "lucide-react"

export default function CoachPage() {
  const { displayName, signOut, providerUserId } = useAuth()
  const mic = useMicrophonePermission()
  const lk = useLiveKitConnection()
  const lyrics = useLyricsManager()

  const [showLibrary, setShowLibrary] = useState(false)
  const [showAssignments, setShowAssignments] = useState(false)

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
    // Request mic permission first
    const granted = await mic.requestPermission()
    if (!granted) return

    await lk.connect(displayName ?? undefined)
  }, [mic, lk, displayName, lyrics])

  const error = lk.error || mic.error

  // Connected — show coaching session
  if (lk.connectionState === "connected" && lk.room) {
    return (
      <div className="h-screen">
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
    return (
      <div className="flex h-screen items-center justify-center px-4">
        <ConnectionError message={error} onRetry={handleStart} />
      </div>
    )
  }

  // Connecting
  if (lk.connectionState === "connecting") {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4" style={{ background: "rgb(15, 18, 23)" }}>
        <Loader2 className="h-10 w-10 animate-spin text-yellow-400" />
        <p className="text-gray-400">Connecting to your coach...</p>
      </div>
    )
  }

  // Disconnected — show StartView with sun orb
  return (
    <div className="h-screen">
      <StartView
        onStartSession={handleStart}
        displayName={displayName}
        onOpenLibrary={() => setShowLibrary(true)}
        onOpenAssignments={() => setShowAssignments(true)}
        onSignOut={signOut}
        isMusicPlaying={lyrics.isMusicPlaying}
        onToggleMusic={lyrics.toggleMusic}
        lyricsLine={lyrics.currentLine}
        lyricsOpacity={lyrics.lyricOpacity}
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
