"use client"

import { useUserStore } from "@/store/userStore"

export function FocusAreas() {
  const focusAreas = useUserStore((s) => s.focusAreas)

  if (focusAreas.length === 0) return null

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900 mb-3">Your Focus Areas</h3>
      <div className="flex flex-wrap gap-2">
        {focusAreas.map((area) => (
          <span
            key={area}
            className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
          >
            {area}
          </span>
        ))}
      </div>
    </div>
  )
}
