"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { OnboardingButton } from "../shared"
import { useOnboardingStore, type CommitmentGoal } from "@/store/onboardingStore"

interface CommitmentScreenProps {
  onNext: () => void
  onBack?: () => void
}

const WEEKS = [1, 2, 3, 4] as const

const WEEK_DATA: Record<CommitmentGoal, {
  improvement: number
  saved: number
  tagline: string
  label?: string
}> = {
  1: { improvement: 45, saved: 143, tagline: "Build your first habits", label: "Your first step" },
  2: { improvement: 77, saved: 286, tagline: "Most users feel a real difference" },
  3: { improvement: 89, saved: 429, tagline: "Where lasting change takes root" },
  4: { improvement: 99, saved: 572, tagline: "The full transformation begins", label: "Your transformation" },
}

// Chart coordinate system — 5 points across (Now, W1, W2, W3, W4)
const ALL_POINTS = [
  { x: 40, y: 160 },  // Now
  { x: 120, y: 135 }, // W1
  { x: 200, y: 100 }, // W2
  { x: 290, y: 60 },  // W3
  { x: 380, y: 20 },  // W4
]

const LABELS = ["Now", "W1", "W2", "W3", "W4"]

function buildCurvePath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return ""
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const cpx1 = prev.x + (curr.x - prev.x) * 0.5
    const cpy1 = prev.y
    const cpx2 = prev.x + (curr.x - prev.x) * 0.5
    const cpy2 = curr.y
    d += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${curr.x} ${curr.y}`
  }
  return d
}

function buildAreaPath(points: { x: number; y: number }[], bottomY: number): string {
  const linePath = buildCurvePath(points)
  const lastPoint = points[points.length - 1]
  const firstPoint = points[0]
  return `${linePath} L ${lastPoint.x} ${bottomY} L ${firstPoint.x} ${bottomY} Z`
}

function GoalChart({ selected }: { selected: CommitmentGoal }) {
  // Solid portion: Now through selected week (0-indexed: week 1 = points 0-1, week 4 = points 0-4)
  const solidPoints = ALL_POINTS.slice(0, selected + 1)
  const solidLine = buildCurvePath(solidPoints)
  const solidArea = buildAreaPath(solidPoints, 175)

  // Dashed portion: from selected week to W4 (if not already at 4)
  const dashedPoints = selected < 4 ? ALL_POINTS.slice(selected) : []
  const dashedLine = dashedPoints.length >= 2 ? buildCurvePath(dashedPoints) : ""

  const data = WEEK_DATA[selected]
  const endPoint = solidPoints[solidPoints.length - 1]

  return (
    <div className="w-full max-w-sm">
      <svg viewBox="0 0 420 200" className="w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="goalAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4CAF50" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#4CAF50" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Dashed future line */}
        {dashedLine && (
          <path
            d={dashedLine}
            fill="none"
            stroke="#4CAF50"
            strokeWidth="2"
            strokeDasharray="8 6"
            opacity="0.3"
          />
        )}

        {/* Solid area fill */}
        <motion.path
          key={`area-${selected}`}
          d={solidArea}
          fill="url(#goalAreaGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        />

        {/* Solid line */}
        <motion.path
          key={`line-${selected}`}
          d={solidLine}
          fill="none"
          stroke="#4CAF50"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />

        {/* Dot markers on solid portion */}
        {solidPoints.map((point, i) => (
          <motion.circle
            key={`dot-${i}`}
            cx={point.x}
            cy={point.y}
            r={i === solidPoints.length - 1 ? 6 : 3.5}
            fill="#4CAF50"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 * i, duration: 0.3 }}
          />
        ))}

        {/* Glow on end dot */}
        <motion.circle
          key={`glow-${selected}`}
          cx={endPoint.x}
          cy={endPoint.y}
          r="12"
          fill="#4CAF50"
          opacity="0.15"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        />

        {/* Label annotation */}
        {data.label && (
          <motion.g
            key={`label-${selected}`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <rect
              x={endPoint.x - 60}
              y={endPoint.y - 30}
              width="120"
              height="22"
              rx="11"
              fill="#4CAF50"
              opacity="0.15"
            />
            <text
              x={endPoint.x}
              y={endPoint.y - 15}
              textAnchor="middle"
              fill="#4CAF50"
              fontSize="11"
              fontWeight="600"
              fontFamily="inherit"
            >
              {data.label}
            </text>
          </motion.g>
        )}

        {/* X-axis labels */}
        {ALL_POINTS.map((point, i) => (
          <text
            key={`xlabel-${i}`}
            x={point.x}
            y="195"
            textAnchor="middle"
            fill="rgba(255,255,255,0.35)"
            fontSize="12"
            fontFamily="inherit"
          >
            {LABELS[i]}
          </text>
        ))}
      </svg>
    </div>
  )
}

function AnimatedNumber({ value }: { value: number }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {value}
    </motion.span>
  )
}

export function CommitmentScreen({ onNext, onBack }: CommitmentScreenProps) {
  const { commitmentGoal, setField } = useOnboardingStore()
  const [selected, setSelected] = useState<CommitmentGoal>(commitmentGoal)
  const data = useMemo(() => WEEK_DATA[selected], [selected])

  function handleNext() {
    setField("commitmentGoal", selected)
    onNext()
  }

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center bg-[#080808] px-6 py-12">
      {onBack && (
        <button type="button" onClick={onBack} className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-white/50 hover:bg-white/5 hover:text-white/80">
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-4 text-center text-[28px] font-bold leading-tight text-white"
      >
        Set your{" "}
        <span className="text-[#4CAF50]">first goal</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mt-3 max-w-sm text-center text-[14px] leading-relaxed text-white/50"
      >
        People who commit to a weekly goal are more likely to see meaningful improvement with Rumi
      </motion.p>

      {/* Chart */}
      <div className="my-6">
        <GoalChart selected={selected} />
      </div>

      {/* Week selector buttons */}
      <div className="mb-4 grid w-full max-w-sm grid-cols-4 gap-2">
        {WEEKS.map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => setSelected(w)}
            className={cn(
              "relative flex flex-col items-center gap-0.5 rounded-xl border py-3 transition-all",
              selected === w
                ? "border-[#4CAF50] bg-[#4CAF50]/10"
                : "border-white/10 hover:border-white/20"
            )}
          >
            {w === 3 && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[#4CAF50]/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#4CAF50]">
                Popular
              </span>
            )}
            <span className={cn(
              "text-[22px] font-bold",
              selected === w ? "text-[#4CAF50]" : "text-white/60"
            )}>
              {w}
            </span>
            <span className={cn(
              "text-[11px]",
              selected === w ? "text-[#4CAF50]/80" : "text-white/40"
            )}>
              week{w > 1 ? "s" : ""}
            </span>
          </button>
        ))}
      </div>

      {/* Dynamic tagline */}
      <AnimatePresence mode="wait">
        <motion.p
          key={data.tagline}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
          className="mb-4 text-center text-[14px] font-medium text-white/70"
        >
          {data.tagline}
        </motion.p>
      </AnimatePresence>

      {/* Stats card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6 flex w-full max-w-sm items-center rounded-2xl border border-white/10 bg-white/5 px-6 py-4"
      >
        <div className="flex-1 text-center">
          <div className="text-[28px] font-bold text-white">
            <AnimatedNumber value={data.improvement} />
            <span>%</span>
          </div>
          <p className="text-[12px] text-white/50">avg. improvement</p>
        </div>
        <div className="mx-4 h-10 w-px bg-white/10" />
        <div className="flex-1 text-center">
          <div className="text-[28px] font-bold text-white">
            <span className="text-white/30 line-through decoration-[#EF4444]/60 decoration-2">${Math.round(data.saved * 1.8)}</span>
            {" "}
            <span className="text-white">${data.saved}</span>
          </div>
          <p className="text-[12px] text-white/50">saved</p>
        </div>
      </motion.div>

      {/* Bottom text */}
      <p className="mb-6 max-w-xs text-center text-[13px] text-white/40">
        This is just the beginning — most people continue well beyond their first goal.
      </p>

      {/* CTA */}
      <div className="w-full max-w-sm">
        <OnboardingButton onClick={handleNext}>
          I&apos;m committing to {selected} week{selected > 1 ? "s" : ""}
        </OnboardingButton>
      </div>
    </div>
  )
}
