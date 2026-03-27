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
import { DayLockedOverlay } from "./day-locked-overlay"
import { DayCompleteCelebration } from "./day-complete-celebration"
import { TeachingCard } from "./teaching-card"
import { AudioVisualizer } from "./audio-visualizer"
import { MicVisualizer } from "./mic-visualizer"
import { type MascotMood } from "./rumi-mascot"
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
  onRequestFeedback: (sessionId: string) => void
  onSessionComplete: () => void
  feedbackDone: boolean
  remoteAudioTrack: MediaStreamTrack | null
}

export function CoachingSession({
  room,
  isMicrophoneEnabled,
  onToggleMic,
  onDisconnect,
  onRequestFeedback,
  onSessionComplete,
  feedbackDone,
  remoteAudioTrack,
}: CoachingSessionProps) {
  // 0 = default (no transcript, no text input)
  // 1 = transcript visible
  // 2 = text input visible
  const [textMode, setTextMode] = useState<0 | 1 | 2>(0)
  const cycleTextMode = () => setTextMode((m) => ((m + 1) % 3) as 0 | 1 | 2)
  const [showSaveOverlay, setShowSaveOverlay] = useState(false)
  const [showLockedOverlay, setShowLockedOverlay] = useState(false)
  const [mascotMood, setMascotMood] = useState<MascotMood>("idle")
  const [orbSize, setOrbSize] = useState(290)
  const audioRef = useRef<HTMLAudioElement>(null)
  const centerAreaRef = useRef<HTMLDivElement>(null)
  const prevStepRef = useRef<number | null>(null)
  const prevHighlightCountRef = useRef(0)
  const mascotTimerRef = useRef<ReturnType<typeof setTimeout>>()
  // One-shot guard — feedback may only be requested once per session mount
  const feedbackRequestedRef = useRef(false)

  const sessionControl = useSessionControl(room)
  const { messages, sendMessage } = useChatMessages(room)
  const { state: celebrationState, streak, celebrate, clear: clearCelebration } = useCelebration()

  // Responsive orb size — fits inside the center area without overlapping visualizers
  useEffect(() => {
    const el = centerAreaRef.current
    if (!el) return
    const obs = new ResizeObserver(([entry]) => {
      const { width: w, height: h } = entry.contentRect
      // Reserve ~120px for visualizers + gaps + padding; clamp 140–290
      setOrbSize(Math.min(290, Math.max(140, Math.min(w - 40, h - 120))))
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

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

  // Show feedback form when end_conversation fires (feedback comes first, save overlay after)
  // feedbackRequestedRef ensures this fires at most once per session mount, regardless of
  // feedbackDone toggling (e.g. during save → disconnect sequencing).
  useEffect(() => {
    if (sessionControl.endConversationCount > 0 && !feedbackDone && !feedbackRequestedRef.current) {
      feedbackRequestedRef.current = true
      onRequestFeedback(room.name || "unknown")
    }
  }, [sessionControl.endConversationCount, feedbackDone, onRequestFeedback, room])

  // After feedback is done, show save overlay
  useEffect(() => {
    if (feedbackDone && sessionControl.endConversationCount > 0) {
      setShowSaveOverlay(true)
    }
  }, [feedbackDone, sessionControl.endConversationCount])

  // Unexpected disconnections are handled at the page level via onRequestFeedback

  // Session gating disabled — no locked overlay

  const handleEndSession = useCallback(async () => {
    // Don't show save overlay yet — feedback form will show first when
    // the agent sends end_conversation, then save overlay after feedback.

    // Send farewell_request via BOTH data channel and text stream.
    // Backend listens on both: data_received (publishData) and
    // register_text_stream_handler (sendText). Belt-and-suspenders
    // to ensure delivery regardless of SDK version compatibility.
    const payload = JSON.stringify({
      type: "farewell_request",
      request_id: crypto.randomUUID(),
    })

    try {
      // Primary: data channel (most reliable, works across all SDK versions)
      const encoder = new TextEncoder()
      await room.localParticipant.publishData(encoder.encode(payload), {
        topic: "rumi.control",
        reliable: true,
      })
    } catch {
      // Fallback: text stream
      try {
        await room.localParticipant.sendText(payload, { topic: "rumi.control" })
      } catch {
        onDisconnect()
      }
    }
  }, [room, onDisconnect])

  const handleSaveComplete = useCallback(() => {
    setShowSaveOverlay(false)
    onSessionComplete()
  }, [onSessionComplete])

  const handleDayCelebrationDismiss = useCallback(() => {
    // Celebration dismissed — no lock, user can continue
  }, [])

  return (
    <div className="flex h-full flex-col relative select-none" style={{ WebkitUserSelect: "none", WebkitTouchCallout: "none" }}>
      {/* Hidden audio element for agent voice playback */}
      <audio ref={audioRef} autoPlay />

      {/* Celebration effects layer */}
      <CelebrationEffects state={celebrationState} onClear={clearCelebration} />

      {/* Center area: transcript OR mascot/orb — always flex-1, no visualizers inside */}
      <div ref={centerAreaRef} className="flex flex-col items-center py-2 flex-1 min-h-0 overflow-hidden w-full">
        {textMode === 1 ? (
          /* Transcript replaces center content when Text mode is active */
          <AgentTranscript messages={messages} />
        ) : (
          /* Mascot / Orb area — fills available space */
          <div className="relative flex flex-1 flex-col items-center justify-center min-h-0">
            <SessionOrb
              currentStep={sessionControl.currentStep ?? 0}
              totalSteps={sessionControl.totalSteps ?? 20}
              stepName={sessionControl.stepName}
              audioTrack={remoteAudioTrack}
              isActive={textMode !== 2}
              currentDay={sessionControl.currentDay}
              totalDays={sessionControl.totalDays}
              isDayLocked={sessionControl.isDayLocked}
              allowedStepMin={sessionControl.allowedStepMin}
              allowedStepMax={sessionControl.allowedStepMax}
              mascotMood={mascotMood}
              size={orbSize}
              sessionPhase={sessionControl.sessionPhase}
            />
            {/* Visual Teacher: full-screen image takeover during teaching */}
            {sessionControl.teachingImage && (
              <TeachingCard
                concept={sessionControl.teachingImage.concept}
                imageUrl={sessionControl.teachingImage.imageUrl}
                altText={sessionControl.teachingImage.altText}
                isActive={sessionControl.isTeaching}
              />
            )}
          </div>
        )}
      </div>

      {/* Visualizers — always below orb/transcript, never overlapping, always visible when active */}
      <div className="flex shrink-0 flex-col items-center gap-1 pointer-events-none pb-1">
        {textMode !== 1 && remoteAudioTrack && (
          <AudioVisualizer audioTrack={remoteAudioTrack} />
        )}
        {isMicrophoneEnabled && (
          <MicVisualizer isMicEnabled={isMicrophoneEnabled} />
        )}
      </div>

      {/* Text input — mode 2 only */}
      {textMode === 2 && <TextInput onSend={sendMessage} />}

      <ControlBar
        isMicrophoneEnabled={isMicrophoneEnabled}
        textMode={textMode}
        onToggleMic={onToggleMic}
        onCycleTextMode={cycleTextMode}
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
          farewellComplete={sessionControl.endConversationCount > 0}
          onComplete={handleSaveComplete}
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
