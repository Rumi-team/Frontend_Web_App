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
import { FeedbackOverlay } from "./feedback-overlay"
import { DayLockedOverlay } from "./day-locked-overlay"
import { DayCompleteCelebration } from "./day-complete-celebration"
import { AudioVisualizer } from "./audio-visualizer"
import { MicVisualizer } from "./mic-visualizer"
import type { MascotMood } from "./rumi-mascot"
import {
  CelebrationEffects,
  StreakBadge,
  useCelebration,
} from "./celebration-effects"

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
  const [showFeedbackOverlay, setShowFeedbackOverlay] = useState(false)
  const [showLockedOverlay, setShowLockedOverlay] = useState(false)
  const [mascotMood, setMascotMood] = useState<MascotMood>("idle")
  const audioRef = useRef<HTMLAudioElement>(null)
  const prevStepRef = useRef<number | null>(null)
  const prevHighlightCountRef = useRef(0)
  const mascotTimerRef = useRef<ReturnType<typeof setTimeout>>()

  const sessionControl = useSessionControl(room)
  const { messages, sendMessage } = useChatMessages(room)
  const { state: celebrationState, streak, celebrate, clear: clearCelebration } = useCelebration()

  // Helper: temporarily change mascot mood, then return to idle
  const flashMascotMood = useCallback((mood: MascotMood, durationMs = 3000) => {
    setMascotMood(mood)
    if (mascotTimerRef.current) clearTimeout(mascotTimerRef.current)
    mascotTimerRef.current = setTimeout(() => setMascotMood("listening"), durationMs)
  }, [])

  // ── Celebration triggers ──

  // 1. Step completion → breakthrough celebration + mascot cheers
  useEffect(() => {
    const step = sessionControl.currentStep
    if (step !== null && prevStepRef.current !== null && step > prevStepRef.current) {
      celebrate("breakthrough")
      flashMascotMood("cheering", 4000)
    }
    prevStepRef.current = step
  }, [sessionControl.currentStep, celebrate, flashMascotMood])

  // 2. Day complete → milestone celebration
  useEffect(() => {
    if (sessionControl.showDayComplete) {
      celebrate("milestone")
      flashMascotMood("celebrating", 5000)
    }
  }, [sessionControl.showDayComplete, celebrate, flashMascotMood])

  // 3. Highlighted text in agent messages → insight spark + mascot impressed
  useEffect(() => {
    const agentMessages = messages.filter((m) => m.content.type === "agent")
    const latest = agentMessages[agentMessages.length - 1]
    if (!latest) return

    const highlightCount = latest.styledSegments.filter((s) => s.isHighlight).length
    if (highlightCount > 0 && highlightCount !== prevHighlightCountRef.current) {
      // Agent highlighted something — likely acknowledging a good point
      celebrate("insight")
      flashMascotMood("impressed", 3000)
    }
    prevHighlightCountRef.current = highlightCount
  }, [messages, celebrate, flashMascotMood])

  // 4. When agent is speaking, mascot listens
  useEffect(() => {
    if (remoteAudioTrack && mascotMood === "idle") {
      setMascotMood("listening")
    }
  }, [remoteAudioTrack, mascotMood])

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

  // Session gating disabled — no locked overlay

  const handleEndSession = useCallback(async () => {
    setShowSaveOverlay(true)

    // Send farewell_request to the server so it can finalize memory,
    // evaluate, and generate assignments while the room stays connected.
    try {
      const payload = JSON.stringify({
        type: "farewell_request",
        request_id: crypto.randomUUID(),
      })
      const encoder = new TextEncoder()
      await room.localParticipant.publishData(encoder.encode(payload), {
        topic: "rumi.control",
        reliable: true,
      })
    } catch {
      // If sending fails (room already closing), fall back to direct disconnect
      onDisconnect()
    }
  }, [room, onDisconnect])

  const handleSaveComplete = useCallback(() => {
    // Disconnect after server finalization is complete
    try {
      room.disconnect()
    } catch {
      // already disconnected
    }
    setShowSaveOverlay(false)
    // Show feedback overlay after save completes
    setShowFeedbackOverlay(true)
  }, [room])

  const handleFeedbackComplete = useCallback(() => {
    setShowFeedbackOverlay(false)
    onDisconnect()
  }, [onDisconnect])

  const handleDayCelebrationDismiss = useCallback(() => {
    // Celebration dismissed — no lock, user can continue
  }, [])

  return (
    <div className="flex h-full flex-col relative">
      {/* Hidden audio element for agent voice playback */}
      <audio ref={audioRef} autoPlay />

      {/* Celebration effects layer */}
      <CelebrationEffects state={celebrationState} onClear={clearCelebration} />

      {/* Transcript at top (like iOS — agent messages only, latest only) */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <AgentTranscript messages={messages} />
      </div>

      {/* Center area: step orb / audio visualizers */}
      <div className="shrink-0 flex flex-col items-center gap-3 py-4">
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
              currentDay={sessionControl.currentDay}
              totalDays={sessionControl.totalDays}
              isDayLocked={sessionControl.isDayLocked}
              allowedStepMin={sessionControl.allowedStepMin}
              allowedStepMax={sessionControl.allowedStepMax}
              mascotMood={mascotMood}
            />
          ) : sessionControl.currentStep !== null &&
            sessionControl.totalSteps !== null ? (
            <StepProgress
              currentStep={sessionControl.currentStep}
              totalSteps={sessionControl.totalSteps}
              stepName={sessionControl.stepName}
              currentDay={sessionControl.currentDay}
              totalDays={sessionControl.totalDays}
              isDayLocked={sessionControl.isDayLocked}
              allowedStepMin={sessionControl.allowedStepMin}
              allowedStepMax={sessionControl.allowedStepMax}
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

      {/* Streak badge — top-right when active */}
      {streak >= 2 && !showSaveOverlay && (
        <div className="absolute top-4 right-4 z-40 animate-mascot-entrance">
          <StreakBadge count={streak} />
        </div>
      )}

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

      {/* Post-session feedback */}
      {showFeedbackOverlay && (
        <FeedbackOverlay
          sessionId={room.name || "unknown"}
          onComplete={handleFeedbackComplete}
        />
      )}

      {/* Day complete celebration */}
      {sessionControl.showDayComplete && !showLockedOverlay && (
        <DayCompleteCelebration
          completedDay={sessionControl.completedDay}
          totalDays={sessionControl.totalDays}
          onDismiss={handleDayCelebrationDismiss}
        />
      )}

      {/* Day locked overlay — disabled, no cooldown constraint */}
    </div>
  )
}
