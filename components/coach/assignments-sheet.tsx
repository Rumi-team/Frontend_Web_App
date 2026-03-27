"use client"

import { useLibraryData } from "@/hooks/use-library-data"
import type { CommitmentData, TransformationData } from "@/lib/types/library"
import {
  X,
  ClipboardList,
  CheckCircle2,
  Clock,
  Loader2,
  BookOpen,
  Zap,
  MessageCircle,
  Eye,
  Sparkles,
} from "lucide-react"

interface AssignmentsSheetProps {
  isOpen: boolean
  onClose: () => void
  providerUserId: string | null
}

/* ---------- Type-based styling ---------- */

const TYPE_CONFIG: Record<
  string,
  { icon: typeof BookOpen; gradient: string; accent: string; label: string }
> = {
  reflection: {
    icon: BookOpen,
    gradient: "linear-gradient(135deg, rgba(168,85,247,0.35) 0%, rgba(88,28,135,0.2) 100%)",
    accent: "rgb(192,132,252)",
    label: "Reflection",
  },
  action: {
    icon: Zap,
    gradient: "linear-gradient(135deg, rgba(234,179,8,0.35) 0%, rgba(161,98,7,0.2) 100%)",
    accent: "rgb(250,204,21)",
    label: "Action",
  },
  conversation: {
    icon: MessageCircle,
    gradient: "linear-gradient(135deg, rgba(59,130,246,0.35) 0%, rgba(30,58,138,0.2) 100%)",
    accent: "rgb(96,165,250)",
    label: "Conversation",
  },
  observation: {
    icon: Eye,
    gradient: "linear-gradient(135deg, rgba(20,184,166,0.35) 0%, rgba(13,148,136,0.2) 100%)",
    accent: "rgb(45,212,191)",
    label: "Observation",
  },
}

const DEFAULT_TYPE_CONFIG = {
  icon: Sparkles,
  gradient: "linear-gradient(135deg, rgba(234,179,8,0.25) 0%, rgba(120,53,15,0.15) 100%)",
  accent: "rgb(253,224,71)",
  label: "Assignment",
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
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Your Assignments">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80" onClick={onClose} onKeyDown={(e) => { if (e.key === "Escape") onClose() }} />

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
            aria-label="Close"
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
  const config = (commitment.type && TYPE_CONFIG[commitment.type]) || DEFAULT_TYPE_CONFIG
  const Icon = config.icon

  return (
    <div
      className="rounded-xl border border-gray-800 overflow-hidden transition-colors hover:border-gray-700"
      style={{ background: "rgba(255,255,255,0.02)" }}
    >
      {/* Gradient header with type icon */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ background: config.gradient }}
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" style={{ color: config.accent }} />
          <span
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: config.accent }}
          >
            {config.label}
          </span>
        </div>
        {isCompleted ? (
          <span
            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{
              background: "rgba(51,178,76,0.2)",
              color: "rgb(74,222,100)",
            }}
          >
            <CheckCircle2 className="h-3 w-3" />
            Done
          </span>
        ) : (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            Active
          </span>
        )}
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-2">
        <p
          className={`text-sm leading-relaxed ${
            isCompleted ? "text-gray-400 line-through" : "text-white"
          }`}
        >
          {commitment.what}
        </p>

        {/* Why context */}
        {commitment.why && (
          <p className="text-xs text-gray-500 italic leading-relaxed">
            {commitment.why}
          </p>
        )}

        {/* Footer: when + created date */}
        <div className="flex items-center gap-3 pt-1">
          {commitment.when && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{commitment.when}</span>
            </div>
          )}
          {commitment.created_at && (
            <span className="text-[10px] text-gray-600">
              {new Date(commitment.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
