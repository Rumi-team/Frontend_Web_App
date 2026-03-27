"use client"

import { useState, useEffect, useCallback } from "react"

interface StepInfo {
  number: number
  concept: string
  status: "completed" | "current" | "locked"
  taught: boolean
  deferred: boolean
  isMilestone: boolean
}

interface SectionInfo {
  day: number
  title: string
  status: "completed" | "active" | "locked"
  steps: StepInfo[]
}

interface ProgressData {
  sections: SectionInfo[]
  currentStep: number
  currentDay: number
  dayCompleted: number
  totalSteps: number
}

interface UseStepProgressReturn {
  data: ProgressData | null
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useStepProgress(): UseStepProgressReturn {
  const [data, setData] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProgress = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch("/api/progress")
      if (!res.ok) {
        throw new Error(`Failed to fetch progress: ${res.status}`)
      }
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  return { data, loading, error, refresh: fetchProgress }
}

export type { StepInfo, SectionInfo, ProgressData }
