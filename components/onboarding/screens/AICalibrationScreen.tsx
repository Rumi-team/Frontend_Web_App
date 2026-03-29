"use client"

import { useState, useMemo } from "react"
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"
import { FABArrow } from "../shared"
import { useOnboardingStore, type RadarCalibration } from "@/store/onboardingStore"

interface AICalibrationScreenProps {
  onNext: () => void
}

const AXES: { key: keyof RadarCalibration; low: string; high: string; label: string }[] = [
  { key: "gentleDirect", low: "Gentle", high: "Direct", label: "Directness" },
  { key: "emotionalAnalytical", low: "Emotional", high: "Analytical", label: "Thinking" },
  { key: "structuredFlexible", low: "Structured", high: "Flexible", label: "Structure" },
  { key: "reservedOpen", low: "Reserved", high: "Open", label: "Openness" },
  { key: "supportiveChallenging", low: "Supportive", high: "Challenging", label: "Challenge" },
]

export function AICalibrationScreen({ onNext }: AICalibrationScreenProps) {
  const { radarCalibration, setField } = useOnboardingStore()
  const [local, setLocal] = useState<RadarCalibration>({ ...radarCalibration })
  const [axisIndex, setAxisIndex] = useState(0)
  const isLastAxis = axisIndex === AXES.length - 1

  const currentAxis = AXES[axisIndex]

  const chartData = useMemo(
    () =>
      AXES.map((axis) => ({
        subject: axis.label,
        value: local[axis.key] * 100,
        fullMark: 100,
      })),
    [local]
  )

  function handleSliderChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = Number(e.target.value) / 100
    setLocal((prev) => ({ ...prev, [currentAxis.key]: value }))
  }

  function handleNext() {
    if (isLastAxis) {
      setField("radarCalibration", local)
      onNext()
    } else {
      setAxisIndex((i) => i + 1)
    }
  }

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-between bg-[#080808] px-6 py-12">
      <h1 className="text-center text-2xl font-bold text-white">
        Fine-tune your coach
      </h1>

      {/* Radar Chart */}
      <div className="w-full max-w-sm">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
              />
              <Radar
                name="calibration"
                dataKey="value"
                stroke="#FFD41A"
                fill="#FFD41A"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Slider */}
        <div className="mt-4">
          <div className="mb-2 flex justify-between text-[13px] text-white/50">
            <span>{currentAxis.low}</span>
            <span className="font-medium text-white">{currentAxis.label}</span>
            <span>{currentAxis.high}</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={local[currentAxis.key] * 100}
            onChange={handleSliderChange}
            className="w-full accent-[#FFD41A]"
          />
        </div>

        {/* Pagination dots */}
        <div className="mt-6 flex justify-center gap-2">
          {AXES.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-2 w-2 rounded-full transition-colors",
                i === axisIndex ? "bg-[#FFD41A]" : "bg-white/20"
              )}
            />
          ))}
        </div>
      </div>

      <FABArrow onClick={handleNext} isCheckmark={isLastAxis} />
    </div>
  )
}
