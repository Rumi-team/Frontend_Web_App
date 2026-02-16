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
  isSessionComplete: boolean
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
  const [isSessionComplete, setIsSessionComplete] = useState(false)

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
    isSessionComplete,
  }
}
