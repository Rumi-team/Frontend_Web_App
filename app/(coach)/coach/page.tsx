"use client"

import { useCallback } from "react"
import { useLiveKitConnection } from "@/hooks/use-livekit-connection"
import { useMicrophonePermission } from "@/hooks/use-microphone-permission"
import { useAuth } from "@/components/auth-provider"
import { CoachingSession } from "@/components/coach/coaching-session"
import { ConnectionError } from "@/components/coach/connection-error"
import { Button } from "@/components/ui/button"
import { Loader2, Mic } from "lucide-react"

export default function CoachPage() {
  const { displayName } = useAuth()
  const mic = useMicrophonePermission()
  const lk = useLiveKitConnection()

  const handleStart = useCallback(async () => {
    // Request mic permission first
    const granted = await mic.requestPermission()
    if (!granted) return

    await lk.connect(displayName ?? undefined)
  }, [mic, lk, displayName])

  const error = lk.error || mic.error

  // Connected — show coaching session
  if (lk.connectionState === "connected" && lk.room) {
    return (
      <div className="h-[calc(100vh-57px)]">
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
      <div className="flex h-[calc(100vh-57px)] items-center justify-center px-4">
        <ConnectionError message={error} onRetry={handleStart} />
      </div>
    )
  }

  // Connecting
  if (lk.connectionState === "connecting") {
    return (
      <div className="flex h-[calc(100vh-57px)] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-yellow-400" />
        <p className="text-gray-400">Connecting to your coach...</p>
      </div>
    )
  }

  // Disconnected — show start button
  return (
    <div className="flex h-[calc(100vh-57px)] flex-col items-center justify-center gap-6 px-4">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white">
          Ready for your session?
        </h1>
        <p className="text-gray-400 text-sm max-w-sm">
          Start a voice coaching session with Rumi. Make sure your microphone is
          available.
        </p>
      </div>

      <Button
        onClick={handleStart}
        className="h-14 px-8 bg-yellow-400 text-black hover:bg-yellow-300 text-lg font-semibold rounded-full"
      >
        <Mic className="mr-2 h-5 w-5" />
        Start Session
      </Button>
    </div>
  )
}
