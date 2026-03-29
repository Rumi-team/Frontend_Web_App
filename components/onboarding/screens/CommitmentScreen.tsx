"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { OnboardingButton } from "../shared"
import { useOnboardingStore, type CommitmentGoal } from "@/store/onboardingStore"

interface CommitmentScreenProps {
  onNext: () => void
  onBack?: () => void
}

const WEEKS = [1, 2, 3, 4] as const

const STATS: Record<CommitmentGoal, { improvement: string; saved: string }> = {
  1: { improvement: "72%", saved: "$89" },
  2: { improvement: "81%", saved: "$189" },
  3: { improvement: "89%", saved: "$329" },
  4: { improvement: "94%", saved: "$429" },
}

function generateChartData(weeks: CommitmentGoal) {
  const points = []
  for (let d = 0; d <= weeks * 7; d++) {
    const progress = d / (weeks * 7)
    const value = 20 + 60 * (1 - Math.pow(1 - progress, 2.5))
    points.push({ day: d, value: Math.round(value) })
  }
  return points
}

export function CommitmentScreen({ onNext, onBack }: CommitmentScreenProps) {
  const { commitmentGoal, setField } = useOnboardingStore()
  const [selected, setSelected] = useState<CommitmentGoal>(commitmentGoal)
  const chartData = useMemo(() => generateChartData(selected), [selected])
  const stats = STATS[selected]

  function handleNext() {
    setField("commitmentGoal", selected)
    onNext()
  }

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-between bg-[#080808] px-6 py-12">
      {onBack && (
        <button type="button" onClick={onBack} className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-white/50 hover:bg-white/5 hover:text-white/80">
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-2xl font-bold text-white"
      >
        Set your goal
      </motion.h1>

      <div className="w-full max-w-sm">
        {/* Chart */}
        <div className="mb-6 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="day" hide />
              <YAxis hide domain={[0, 100]} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#FFD41A"
                strokeWidth={2.5}
                dot={false}
                animationDuration={600}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Week buttons */}
        <div className="mb-6 grid grid-cols-4 gap-2">
          {WEEKS.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setSelected(w)}
              className={cn(
                "relative rounded-xl border py-3 text-center text-[14px] font-medium transition-all",
                selected === w
                  ? "border-[#FFD41A] bg-[#FFD41A]/10 text-white"
                  : "border-white/10 text-white/50 hover:border-white/20"
              )}
            >
              {w} week{w > 1 ? "s" : ""}
              {w === 3 && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[#FFD41A] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                  Popular
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="mb-8 flex justify-center gap-6">
          <div className="text-center">
            <div className="text-xl font-bold text-[#FFD41A]">{stats.improvement}</div>
            <div className="text-[12px] text-white/50">avg. improvement</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-[#FFD41A]">{stats.saved}</div>
            <div className="text-[12px] text-white/50">saved vs. therapy</div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-sm">
        <OnboardingButton onClick={handleNext}>
          I&apos;m committing to {selected} week{selected > 1 ? "s" : ""}
        </OnboardingButton>
      </div>
    </div>
  )
}
