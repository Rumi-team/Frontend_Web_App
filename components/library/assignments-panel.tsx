"use client"

import { useCallback, useEffect, useState } from "react"
import { CheckCircle2, Circle, Loader2 } from "lucide-react"

interface Commitment {
  what: string
  when: string | null
  status: string
  created_at: string | null
}

export function AssignmentsPanel() {
  const [commitments, setCommitments] = useState<Commitment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [togglingIdx, setTogglingIdx] = useState<number | null>(null)

  const fetchCommitments = useCallback(async () => {
    try {
      const res = await fetch("/api/user/commitments")
      if (!res.ok) throw new Error("Failed to fetch commitments")
      const data = await res.json()
      setCommitments(data.commitments ?? [])
    } catch {
      setError("Could not load assignments.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCommitments()
  }, [fetchCommitments])

  const toggleStatus = async (idx: number) => {
    const commitment = commitments[idx]
    const newStatus = commitment.status === "completed" ? "active" : "completed"

    // Optimistic update
    const previous = [...commitments]
    setCommitments((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, status: newStatus } : c))
    )
    setTogglingIdx(idx)

    try {
      const res = await fetch("/api/user/commitments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ what: commitment.what, status: newStatus }),
      })

      if (!res.ok) {
        throw new Error("Failed to update")
      }
    } catch {
      // Revert optimistic update
      setCommitments(previous)
      setError("Failed to update assignment. Please try again.")
      setTimeout(() => setError(null), 3000)
    } finally {
      setTogglingIdx(null)
    }
  }

  const activeCount = commitments.filter(
    (c) => c.status === "active" || !c.status
  ).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
      </div>
    )
  }

  if (commitments.length === 0) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 text-center">
        <p className="text-sm text-gray-500">
          No active assignments. Complete a session to get your next assignment.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-white">Active Assignments</h2>
        {activeCount > 0 && (
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-yellow-500/20 px-1.5 text-xs font-semibold text-yellow-400">
            {activeCount}
          </span>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      <div className="space-y-2">
        {commitments.map((commitment, idx) => {
          const isCompleted = commitment.status === "completed"
          const isToggling = togglingIdx === idx

          return (
            <div
              key={`${commitment.what}-${idx}`}
              className="flex items-start gap-3 rounded-xl border border-gray-800 bg-gray-900 p-4 transition-colors hover:border-gray-700"
            >
              <button
                onClick={() => toggleStatus(idx)}
                disabled={isToggling}
                className="mt-0.5 flex-shrink-0 transition-colors"
                aria-label={isCompleted ? "Mark as active" : "Mark as completed"}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-600 hover:text-gray-400" />
                )}
              </button>

              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm ${
                    isCompleted
                      ? "text-gray-500 line-through opacity-50"
                      : "text-white"
                  }`}
                >
                  {commitment.what}
                </p>
                {commitment.when && (
                  <p className="mt-1 text-xs text-gray-500">{commitment.when}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
