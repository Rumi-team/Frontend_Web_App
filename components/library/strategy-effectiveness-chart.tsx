"use client"

import { useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import type { TrajectoryDataPoint } from "@/lib/types/library"

interface StrategyEffectivenessChartProps {
  data: TrajectoryDataPoint[]
}

export function StrategyEffectivenessChart({ data }: StrategyEffectivenessChartProps) {
  const chartData = useMemo(() => {
    const strategyMap = new Map<string, { total: number; count: number }>()
    for (const point of data) {
      const strategy = point.strategy ?? "unknown"
      const existing = strategyMap.get(strategy) ?? { total: 0, count: 0 }
      existing.total += point.transformation
      existing.count += 1
      strategyMap.set(strategy, existing)
    }
    return Array.from(strategyMap.entries())
      .map(([strategy, { total, count }]) => ({
        strategy: strategy.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        avgTransformation: Math.round((total / count) * 10) / 10,
      }))
      .sort((a, b) => b.avgTransformation - a.avgTransformation)
  }, [data])

  if (chartData.length < 2) return null

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-400">Strategy Effectiveness</h3>
      <div className="rounded-xl border border-gray-800 p-4" style={{ background: "rgba(255,255,255,0.02)" }}>
        <ResponsiveContainer width="100%" height={chartData.length * 48 + 20}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20, top: 5, bottom: 5 }}>
            <XAxis type="number" domain={[0, 10]} tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="strategy" tick={{ fill: "#9ca3af", fontSize: 12 }} width={140} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: "8px", color: "#fff", fontSize: 12 }}
              formatter={(value: number) => [`${value}/10`, "Avg Transformation"]}
            />
            <Bar dataKey="avgTransformation" radius={[0, 4, 4, 0]} maxBarSize={24}>
              {chartData.map((_, index) => (
                <Cell key={index} fill="#facc15" fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
