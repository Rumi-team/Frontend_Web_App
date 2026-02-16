"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Hourglass, CheckCircle2 } from "lucide-react"

interface SessionSaveOverlayProps {
  progress: number
  stage: string | null
  onComplete: () => void
}

const STAGE_LABELS: Record<string, string> = {
  starting: "Saving your session...",
  summary_generated: "Generating summary...",
  evaluating_progress: "Evaluating your progress...",
  evaluation_saved: "Evaluation saved...",
  complete: "Session saved!",
}

export function SessionSaveOverlay({
  progress,
  stage,
  onComplete,
}: SessionSaveOverlayProps) {
  const [isComplete, setIsComplete] = useState(false)
  const label = stage ? STAGE_LABELS[stage] ?? stage : "Saving..."

  useEffect(() => {
    if (stage === "complete") {
      setIsComplete(true)
      const timer = setTimeout(onComplete, 2000)
      return () => clearTimeout(timer)
    }
  }, [stage, onComplete])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 px-8 text-center">
        {isComplete ? (
          <CheckCircle2 className="h-12 w-12 text-green-400" />
        ) : (
          <Hourglass className="h-12 w-12 text-yellow-400 animate-pulse" />
        )}

        <p className="text-lg text-white">{label}</p>

        <div className="w-64">
          <Progress value={progress} className="h-2 bg-gray-800" />
        </div>
      </div>
    </div>
  )
}
