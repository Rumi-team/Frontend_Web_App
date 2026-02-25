"use client"

import { AlertTriangle, TrendingDown } from "lucide-react"
import type { GrowthSnapshot } from "@/lib/types/library"

interface GrowthAlertBannerProps {
  snapshot: GrowthSnapshot
}

export function GrowthAlertBanner({ snapshot }: GrowthAlertBannerProps) {
  if (!snapshot.alert_type) return null

  const isRegression = snapshot.alert_type === "regression_warning"

  return (
    <div
      className="flex items-start gap-3 rounded-xl border p-4"
      style={{
        borderColor: isRegression ? "rgba(239,68,68,0.3)" : "rgba(234,179,8,0.3)",
        background: isRegression ? "rgba(239,68,68,0.05)" : "rgba(234,179,8,0.05)",
      }}
    >
      {isRegression ? (
        <TrendingDown className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "rgb(239,68,68)" }} />
      ) : (
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "rgb(234,179,8)" }} />
      )}
      <div>
        <h4
          className="text-sm font-semibold"
          style={{ color: isRegression ? "rgb(239,68,68)" : "rgb(234,179,8)" }}
        >
          {isRegression ? "Regression Detected" : "Growth Plateau"}
        </h4>
        {snapshot.alert_message && (
          <p className="mt-1 text-xs text-gray-400">{snapshot.alert_message}</p>
        )}
      </div>
    </div>
  )
}
