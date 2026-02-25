"use client"

import { useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import type { TrajectoryDataPoint, GrowthSnapshot } from "@/lib/types/library"

interface GrowthTrajectoryChartProps {
  data: TrajectoryDataPoint[]
  snapshot: GrowthSnapshot | null
}

const TREND_COLORS: Record<string, { bg: string; text: string }> = {
  rising: { bg: "rgba(34,197,94,0.1)", text: "rgb(34,197,94)" },
  breakthrough: { bg: "rgba(250,204,21,0.1)", text: "#facc15" },
  plateau: { bg: "rgba(234,179,8,0.1)", text: "rgb(234,179,8)" },
  declining: { bg: "rgba(239,68,68,0.1)", text: "rgb(239,68,68)" },
}

export function GrowthTrajectoryChart({ data, snapshot }: GrowthTrajectoryChartProps) {
  const chartData = useMemo(() => {
    return data.map((point) => ({
      ...point,
      date: new Date(point.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }))
  }, [data])

  if (chartData.length < 2) return null

  const trend = snapshot?.trend
  const trendStyle = trend ? TREND_COLORS[trend] : null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-400">Growth Trajectory</h3>
        {trend && trendStyle && (
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{ background: trendStyle.bg, color: trendStyle.text }}
          >
            {trend.charAt(0).toUpperCase() + trend.slice(1)}
          </span>
        )}
      </div>
      <div className="rounded-xl border border-gray-800 p-4" style={{ background: "rgba(255,255,255,0.02)" }}>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
            <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 10]} tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: "8px", color: "#fff", fontSize: 12 }}
              labelStyle={{ color: "#9ca3af" }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
            <Line type="monotone" dataKey="transformation" stroke="#facc15" strokeWidth={2.5} dot={{ r: 3, fill: "#facc15" }} name="Transformation" />
            <Line type="monotone" dataKey="engagement" stroke="#22c55e" strokeWidth={1.5} dot={false} name="Engagement" />
            <Line type="monotone" dataKey="depth" stroke="#a855f7" strokeWidth={1.5} dot={false} name="Depth" />
            <Line type="monotone" dataKey="resistance" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="5 3" dot={false} name="Resistance" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
