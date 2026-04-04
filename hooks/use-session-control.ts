"use client"

import { useState, useEffect, useCallback } from "react"
import type { Room } from "livekit-client"
import type {
  SessionControlAction,
  SessionControlMessage,
  VisualizationImageData,
} from "@/lib/types/livekit"

interface UseSessionControlReturn {
  showProgramSelection: boolean
  programs: string[]
  selectedProgram: string | null
  currentStep: number | null
  stepName: string | null
  totalSteps: number | null
  sessionSaveProgress: number
  sessionSaveStage: string | null
  visualizationImages: VisualizationImageData[]
  endConversationCount: number
  farewellComplete: boolean
  isSessionComplete: boolean
  // Session gating
  currentDay: number
  totalDays: number
  isDayLocked: boolean
  cooldownRemainingHours: number
  unlockAt: string | null
  allowedStepMin: number
  allowedStepMax: number
  showDayComplete: boolean
  completedDay: number
  // Session phase (Listening Coach)
  sessionPhase: "opening" | "coaching" | "closing" | null
  // Visual Teacher
  teachingImage: { concept: string; imageUrl: string; altText: string } | null
  isTeaching: boolean
}

export function useSessionControl(
  room: Room | null
): UseSessionControlReturn {
  const [showProgramSelection, setShowProgramSelection] = useState(false)
  const [programs, setPrograms] = useState<string[]>([])
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<number | null>(null)
  const [stepName, setStepName] = useState<string | null>(null)
  const [totalSteps, setTotalSteps] = useState<number | null>(null)
  const [sessionSaveProgress, setSessionSaveProgress] = useState(0)
  const [sessionSaveStage, setSessionSaveStage] = useState<string | null>(null)
  const [visualizationImages, setVisualizationImages] = useState<
    VisualizationImageData[]
  >([])
  const [endConversationCount, setEndConversationCount] = useState(0)
  const [farewellComplete, setFarewellComplete] = useState(false)
  const [isSessionComplete, setIsSessionComplete] = useState(false)
  // Session gating state
  const [currentDay, setCurrentDay] = useState(1)
  const [totalDays, setTotalDays] = useState(3)
  const [isDayLocked, setIsDayLocked] = useState(false)
  const [cooldownRemainingHours, setCooldownRemainingHours] = useState(0)
  const [unlockAt, setUnlockAt] = useState<string | null>(null)
  const [allowedStepMin, setAllowedStepMin] = useState(1)
  const [allowedStepMax, setAllowedStepMax] = useState(5)
  const [showDayComplete, setShowDayComplete] = useState(false)
  const [completedDay, setCompletedDay] = useState(0)
  const [sessionPhase, setSessionPhase] = useState<"opening" | "coaching" | "closing" | null>(null)
  const [teachingImage, setTeachingImage] = useState<{ concept: string; imageUrl: string; altText: string } | null>(null)
  const [isTeaching, setIsTeaching] = useState(false)

  const handleMessage = useCallback((msg: SessionControlMessage) => {
    switch (msg.action) {
      case "show_program_selection":
        setPrograms(msg.programs ?? [])
        setShowProgramSelection(true)
        break

      case "program_selected":
        setSelectedProgram(msg.program ?? null)
        setShowProgramSelection(false)
        break

      case "step_progress":
        setCurrentStep(msg.step ?? null)
        setStepName(msg.step_name ?? null)
        setTotalSteps(msg.total_steps ?? null)
        break

      case "program_complete":
        break

      case "show_future_visualization":
        if (msg.images) setVisualizationImages(msg.images)
        break

      case "farewell_complete":
        setFarewellComplete(true)
        break

      case "end_conversation":
        setEndConversationCount((c) => c + 1)
        break

      case "session_save_progress":
        setSessionSaveProgress(msg.progress ?? 0)
        setSessionSaveStage(msg.stage ?? null)
        if (msg.stage === "complete") {
          setIsSessionComplete(true)
        }
        break

      case "session_gate_status":
        if (msg.current_day != null) setCurrentDay(msg.current_day)
        if (msg.total_days != null) setTotalDays(msg.total_days)
        setIsDayLocked(msg.is_locked ?? false)
        setCooldownRemainingHours(msg.cooldown_remaining_hours ?? 0)
        setUnlockAt(msg.unlock_at ?? null)
        if (msg.allowed_step_min != null) setAllowedStepMin(msg.allowed_step_min)
        if (msg.allowed_step_max != null) setAllowedStepMax(msg.allowed_step_max)
        break

      case "day_complete":
        setCompletedDay(msg.day ?? 0)
        setIsDayLocked(true)
        if (msg.cooldown_hours != null) setCooldownRemainingHours(msg.cooldown_hours)
        if (msg.next_unlock_at) setUnlockAt(msg.next_unlock_at)
        setShowDayComplete(true)
        break

      case "session_phase":
        if (msg.phase) setSessionPhase(msg.phase as "opening" | "coaching" | "closing")
        break

      case "step_deferred":
        // Analytics-only: step was deferred for later revisit
        break

      case "concept_image":
        if (msg.image_url && msg.concept) {
          setTeachingImage({
            concept: msg.concept as string,
            imageUrl: msg.image_url as string,
            altText: (msg.alt_text as string) || `Illustration of ${msg.concept}`,
          })
          setIsTeaching(true)
        }
        break

      case "teaching_complete":
        setIsTeaching(false)
        // Keep teachingImage for a brief crossfade, then clear
        setTimeout(() => setTeachingImage(null), 1000)
        break

      case "greeting_started":
      case "session_bootstrap":
      case "show_journey_orb":
        // UI-only signals, handled as needed
        break
    }
  }, [])

  useEffect(() => {
    if (!room) return

    const topic = "rumi.session.control"

    room.registerTextStreamHandler(topic, async (reader) => {
      try {
        const content = await reader.readAll()
        const parsed = JSON.parse(content)
        if (parsed.type === "session_control" && parsed.action) {
          handleMessage(parsed as SessionControlMessage)
        }
      } catch (err) {
        console.error("Failed to parse session control message:", err)
      }
    })

    return () => {
      room.unregisterTextStreamHandler(topic)
    }
  }, [room, handleMessage])

  return {
    showProgramSelection,
    programs,
    selectedProgram,
    currentStep,
    stepName,
    totalSteps,
    sessionSaveProgress,
    sessionSaveStage,
    visualizationImages,
    endConversationCount,
    farewellComplete,
    isSessionComplete,
    currentDay,
    totalDays,
    isDayLocked,
    cooldownRemainingHours,
    unlockAt,
    allowedStepMin,
    allowedStepMax,
    showDayComplete,
    completedDay,
    sessionPhase,
    teachingImage,
    isTeaching,
  }
}
