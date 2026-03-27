"use client"

import { useState } from "react"
import type { SectionInfo } from "@/hooks/use-step-progress"

interface SectionBannerProps {
  section: SectionInfo
  children: React.ReactNode
}

export function SectionBanner({ section, children }: SectionBannerProps) {
  const isActive = section.status === "active"
  const isCompleted = section.status === "completed"
  const isLocked = section.status === "locked"
  const [expanded, setExpanded] = useState(isActive || isCompleted)

  return (
    <div className="mb-6">
      {/* Banner header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`
          w-full flex items-center justify-between px-4 py-3 rounded-lg
          transition-all duration-300
          ${isActive
            ? "bg-yellow-500/10 border border-yellow-500/30"
            : isCompleted
              ? "bg-yellow-500/5 border border-yellow-500/15 hover:bg-yellow-500/10"
              : "bg-gray-800/30 border border-gray-700/30"
          }
        `}
      >
        <div className="flex items-center gap-3">
          {isLocked && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-gray-500">
              <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2"/>
            </svg>
          )}
          <div className="text-left">
            <p className={`
              text-xs font-semibold uppercase tracking-widest
              ${isActive ? "text-yellow-500" : isCompleted ? "text-yellow-500/60" : "text-gray-500"}
            `}>
              Day {section.day}
            </p>
            <p className={`
              text-sm font-medium
              ${isActive ? "text-white" : isCompleted ? "text-gray-300" : "text-gray-500"}
            `}>
              {section.title}
            </p>
          </div>
        </div>

        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          className={`
            transition-transform duration-200 text-gray-500
            ${expanded ? "rotate-180" : ""}
          `}
        >
          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Steps content */}
      {expanded && (
        <div className="mt-4 pl-2">
          {children}
        </div>
      )}
    </div>
  )
}
