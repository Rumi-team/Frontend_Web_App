"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { Room } from "livekit-client"
import { useSessionControl } from "@/hooks/use-session-control"
import { useChatMessages } from "@/hooks/use-chat-messages"
import { AgentTranscript } from "./agent-transcript"
import { ControlBar } from "./control-bar"
import { TextInput } from "./text-input"
import { ProgramSelection } from "./program-selection"
import { StepProgress } from "./step-progress"
import { SessionOrb } from "./session-orb"
import { SessionSaveOverlay } from "./session-save-overlay"
import { AudioVisualizer } from "./audio-visualizer"
import { MicVisualizer } from "./mic-visualizer"

interface CoachingSessionProps {
  room: Room
  isMicrophoneEnabled: boolean
  onToggleMic: () => void
  onDisconnect: () => void
  remoteAudioTrack: MediaStreamTrack | null
}

export function CoachingSession({
  room,
  isMicrophoneEnabled,
  onToggleMic,
  onDisconnect,
  remoteAudioTrack,
}: CoachingSessionProps) {
  const [isTextMode, setIsTextMode] = useState(false)
  const [showSaveOverlay, setShowSaveOverlay] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const sessionControl = useSessionControl(room)
  const { messages, sendMessage } = useChatMessages(room)

  // Attach remote audio track to <audio> element for playback
  useEffect(() => {
    if (remoteAudioTrack && audioRef.current) {
      const stream = new MediaStream([remoteAudioTrack])
      audioRef.current.srcObject = stream
      audioRef.current.play().catch(() => {
        // Autoplay blocked — user interaction needed (handled by initial click)
      })
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.srcObject = null
      }
    }
  }, [remoteAudioTrack])

  // Show save overlay when end_conversation fires
  useEffect(() => {
    if (sessionControl.endConversationCount > 0) {
      setShowSaveOverlay(true)
    }
  }, [sessionControl.endConversationCount])

  const handleEndSession = useCallback(() => {
    onDisconnect()
    setShowSaveOverlay(true)
  }, [onDisconnect])

  const handleSaveComplete = useCallback(() => {
    // Force disconnect the room
    if (room && (room as any).__forceDisconnect) {
      ;(room as any).__forceDisconnect()
    } else {
      room.disconnect()
    }
    setShowSaveOverlay(false)
  }, [room])

  return (
    <div className="flex h-full flex-col">
      {/* Hidden audio element for agent voice playback */}
      <audio ref={audioRef} autoPlay />

      {/* Transcript at top (like iOS) */}
      <div className="flex-1 overflow-hidden">
        <AgentTranscript messages={messages} />
      </div>

      {/* Center area: step orb / audio visualizers */}
      <div className="flex flex-col items-center gap-4 py-6">
        {/* Step progress — orb when program active, bar as fallback */}
        {sessionControl.currentStep !== null &&
          sessionControl.totalSteps !== null &&
          sessionControl.selectedProgram ? (
            <SessionOrb
              currentStep={sessionControl.currentStep}
              totalSteps={sessionControl.totalSteps}
              stepName={sessionControl.stepName}
              audioTrack={remoteAudioTrack}
              isActive={!isTextMode}
            />
          ) : sessionControl.currentStep !== null &&
            sessionControl.totalSteps !== null ? (
            <StepProgress
              currentStep={sessionControl.currentStep}
              totalSteps={sessionControl.totalSteps}
              stepName={sessionControl.stepName}
            />
          ) : null}

        {/* Agent audio visualizer — when no session orb */}
        {!isTextMode && remoteAudioTrack && !sessionControl.selectedProgram && (
          <AudioVisualizer audioTrack={remoteAudioTrack} />
        )}

        {/* Mic input visualizer — shows user's voice as equalizer bars */}
        {!isTextMode && (
          <MicVisualizer isMicEnabled={isMicrophoneEnabled} />
        )}
      </div>

      {/* Text input or control bar */}
      {isTextMode ? (
        <TextInput onSend={sendMessage} />
      ) : null}

      <ControlBar
        isMicrophoneEnabled={isMicrophoneEnabled}
        isTextMode={isTextMode}
        onToggleMic={onToggleMic}
        onToggleTextMode={() => setIsTextMode((v) => !v)}
        onEndSession={handleEndSession}
      />

      {/* Program selection overlay */}
      {sessionControl.showProgramSelection && (
        <ProgramSelection
          programs={sessionControl.programs}
          room={room}
        />
      )}

      {/* Session save overlay */}
      {showSaveOverlay && (
        <SessionSaveOverlay
          progress={sessionControl.sessionSaveProgress}
          stage={sessionControl.sessionSaveStage}
          onComplete={handleSaveComplete}
        />
      )}
    </div>
  )
}
