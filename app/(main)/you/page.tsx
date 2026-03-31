"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { ProfileCard } from "@/components/app/you/ProfileCard"
import { StatsGrid } from "@/components/app/you/StatsGrid"
import { FocusAreas } from "@/components/app/you/FocusAreas"
import { TransformationCard } from "@/components/app/you/TransformationCard"
import { LibrarySheet } from "@/components/library/library-sheet"
import { AssignmentsSheet } from "@/components/coach/assignments-sheet"
import { BookOpen, ClipboardList } from "lucide-react"

export default function YouPage() {
  const { providerUserId, displayName } = useAuth()
  const [showLibrary, setShowLibrary] = useState(false)
  const [showAssignments, setShowAssignments] = useState(false)

  return (
    <div className="flex flex-col gap-4 px-4 pt-8 pb-4" style={{ background: "var(--app-bg, #FAF8F3)" }}>
      <ProfileCard />
      <StatsGrid />

      {/* About You placeholder (v2) */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 mb-2">About You</h3>
        <p className="text-sm text-gray-500 italic">
          Complete a few sessions and Rumi will write a personalized summary of you here.
        </p>
        <p className="mt-2 text-xs text-gray-400">This is regularly updated by Rumi</p>
      </div>

      <TransformationCard providerUserId={providerUserId} />

      <FocusAreas />

      {/* Journey + Assignments buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setShowLibrary(true)}
          className="flex items-center gap-2 rounded-2xl bg-white p-4 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <BookOpen className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Your Journey</span>
        </button>
        <button
          onClick={() => setShowAssignments(true)}
          className="flex items-center gap-2 rounded-2xl bg-white p-4 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <ClipboardList className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Assignments</span>
        </button>
      </div>

      <LibrarySheet
        isOpen={showLibrary}
        onClose={() => setShowLibrary(false)}
        providerUserId={providerUserId}
        displayName={displayName}
      />
      <AssignmentsSheet
        isOpen={showAssignments}
        onClose={() => setShowAssignments(false)}
        providerUserId={providerUserId}
      />
    </div>
  )
}
