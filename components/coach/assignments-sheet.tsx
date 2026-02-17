"use client"

import { useLibraryData } from "@/hooks/use-library-data"
import type { CommitmentData, TransformationData } from "@/lib/types/library"
import { X, ClipboardList, Circle, CheckCircle2, Clock, Loader2 } from "lucide-react"

interface AssignmentsSheetProps {
  isOpen: boolean
  onClose: () => void
  providerUserId: string | null
}

export function AssignmentsSheet({
  isOpen,
  onClose,
  providerUserId,
}: AssignmentsSheetProps) {
  const { commitments, transformation, isLoading } =
    useLibraryData(providerUserId)

  if (!isOpen) return null

  // Sort: active first, then completed, ordered by created_at desc
  const sorted = [...commitments].sort((a, b) => {
    const aActive = a.status !== "completed"
    const bActive = b.status !== "completed"
    if (aActive !== bActive) return aActive ? -1 : 1
    const aDate = a.created_at ? new Date(a.created_at).getTime() : 0
    const bDate = b.created_at ? new Date(b.created_at).getTime() : 0
    return bDate - aDate
  })

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />

      {/* Sheet panel */}
      <div
        className="relative z-10 flex h-full w-full max-w-lg flex-col overflow-hidden border-l border-gray-800 sm:max-w-md"
        style={{ background: "rgb(15, 18, 23)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
          <h2 className="text-2xl font-bold text-white">Your Assignments</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
            </div>
          ) : (
            <>
              {/* Stats summary */}
              {transformation && (
                <AssignmentStats transformation={transformation} />
              )}

              {/* Commitments list */}
              {sorted.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <ClipboardList className="h-10 w-10 text-gray-600" />
                  <p className="text-sm text-gray-500">No assignments yet</p>
                  <p className="text-xs text-gray-600 max-w-[240px]">
                    Assignments from your coaching sessions will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sorted.map((c, i) => (
                    <CommitmentCard key={i} commitment={c} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ---------- AssignmentStats ---------- */

function AssignmentStats({
  transformation,
}: {
  transformation: TransformationData
}) {
  const given = transformation.assignments_given ?? 0
  const completed = transformation.assignments_completed ?? 0
  const rate = transformation.completion_rate
    ? Math.round(transformation.completion_rate * 100)
    : 0

  if (given === 0) return null

  return (
    <div
      className="grid grid-cols-3 gap-2 rounded-xl p-3"
      style={{ background: "rgba(255,255,255,0.03)" }}
    >
      <div className="text-center">
        <p className="text-lg font-bold text-white">{given}</p>
        <p className="text-[10px] text-gray-500">Given</p>
      </div>
      <div className="text-center">
        <p className="text-lg font-bold text-white">{completed}</p>
        <p className="text-[10px] text-gray-500">Completed</p>
      </div>
      <div className="text-center">
        <p className="text-lg font-bold text-white">{rate}%</p>
        <p className="text-[10px] text-gray-500">Rate</p>
      </div>
    </div>
  )
}

/* ---------- CommitmentCard ---------- */

function CommitmentCard({ commitment }: { commitment: CommitmentData }) {
  const isCompleted = commitment.status === "completed"

  return (
    <div
      className="flex items-start gap-3 rounded-xl border border-gray-800 p-4"
      style={{ background: "rgba(255,255,255,0.02)" }}
    >
      {/* Status icon */}
      <div className="mt-0.5 shrink-0">
        {isCompleted ? (
          <CheckCircle2 className="h-5 w-5" style={{ color: "rgb(51,178,76)" }} />
        ) : (
          <Circle className="h-5 w-5 text-gray-500" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-sm text-white leading-relaxed">{commitment.what}</p>
        {commitment.when && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>{commitment.when}</span>
          </div>
        )}
      </div>

      {/* Status badge */}
      <div className="shrink-0">
        {isCompleted ? (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{
              background: "rgba(51,178,76,0.15)",
              color: "rgb(51,178,76)",
            }}
          >
            Completed
          </span>
        ) : (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{
              background: "rgba(74,80,90,0.3)",
              color: "rgb(189,204,230)",
            }}
          >
            Active
          </span>
        )}
      </div>
    </div>
  )
}
