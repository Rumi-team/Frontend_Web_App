"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ShieldCheck, Info } from "lucide-react"
import { OnboardingButton } from "../shared"

interface ProvenResultsScreenProps {
  onNext: () => void
  onBack?: () => void
}

function AnimatedStat({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const start = target * 0.4
    const duration = 1500
    const startTime = Date.now()

    function animate() {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(start + (target - start) * eased))

      if (progress < 1) requestAnimationFrame(animate)
    }

    const timeout = setTimeout(animate, 300)
    return () => clearTimeout(timeout)
  }, [target])

  return (
    <span>
      {value}
      {suffix}
    </span>
  )
}

// SVG progress chart points — exponential upward curve (Start → W1 → W2 → W3 → W4)
const CHART_POINTS = [
  { x: 40, y: 170 },  // Start
  { x: 120, y: 145 }, // W1
  { x: 200, y: 115 }, // W2
  { x: 290, y: 75 },  // W3
  { x: 380, y: 30 },  // W4
]

function buildPath(points: typeof CHART_POINTS): string {
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

function buildAreaPath(points: typeof CHART_POINTS, bottomY: number): string {
  const linePath = buildPath(points)
  const lastPoint = points[points.length - 1]
  const firstPoint = points[0]
  return `${linePath} L ${lastPoint.x} ${bottomY} L ${firstPoint.x} ${bottomY} Z`
}

function ProgressChart() {
  const linePath = buildPath(CHART_POINTS)
  const areaPath = buildAreaPath(CHART_POINTS, 180)
  const lastPoint = CHART_POINTS[CHART_POINTS.length - 1]
  const labels = ["Start", "W1", "W2", "W3", "W4"]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="w-full max-w-sm"
    >
      <svg viewBox="0 0 420 210" className="w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4CAF50" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#4CAF50" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <motion.path
          d={areaPath}
          fill="url(#areaGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        />

        {/* Line */}
        <motion.path
          d={linePath}
          fill="none"
          stroke="#4CAF50"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.6, duration: 1.2, ease: "easeOut" }}
        />

        {/* Dot markers */}
        {CHART_POINTS.map((point, i) => (
          <motion.circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={i === CHART_POINTS.length - 1 ? 7 : 4}
            fill="#4CAF50"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8 + i * 0.15 }}
          />
        ))}

        {/* Glow on last dot */}
        <motion.circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r="14"
          fill="#4CAF50"
          opacity="0.15"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.4 }}
        />

        {/* X-axis labels */}
        {CHART_POINTS.map((point, i) => (
          <text
            key={`label-${i}`}
            x={point.x}
            y="200"
            textAnchor="middle"
            fill="rgba(255,255,255,0.4)"
            fontSize="12"
            fontFamily="inherit"
          >
            {labels[i]}
          </text>
        ))}
      </svg>
    </motion.div>
  )
}

export function ProvenResultsScreen({ onNext, onBack }: ProvenResultsScreenProps) {
  const [showStudyInfo, setShowStudyInfo] = useState(false)

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center bg-[#080808] px-6 py-12">
      {onBack && (
        <button type="button" onClick={onBack} className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-white/50 hover:bg-white/5 hover:text-white/80">
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {/* Clinically Proven badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 flex items-center gap-2 rounded-full border border-[#4CAF50]/30 bg-[#4CAF50]/10 px-4 py-1.5"
      >
        <ShieldCheck className="h-4 w-4 text-[#4CAF50]" />
        <span className="text-[13px] font-semibold uppercase tracking-wider text-[#4CAF50]">
          Clinically Proven
        </span>
      </motion.div>

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6 text-center text-[28px] font-bold leading-tight text-white"
      >
        People{" "}
        <span className="text-[#4CAF50]">feel better</span>
        <br />
        with Rumi
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-4 max-w-sm text-center text-[15px] leading-relaxed text-white/60"
      >
        Independent university researchers have shown that Rumi significantly reduces anxiety and depression symptoms.
      </motion.p>

      {/* About this study */}
      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={() => setShowStudyInfo(!showStudyInfo)}
        className="mt-3 flex items-center gap-1.5 text-[13px] text-white/40 hover:text-white/60"
      >
        <Info className="h-3.5 w-3.5" />
        About this study
      </motion.button>

      {showStudyInfo && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-2 max-w-sm text-center text-[12px] leading-relaxed text-white/40"
        >
          Results based on self-reported outcomes from users who completed at least 4 weeks of coaching sessions. Improvement measured across anxiety and wellbeing scales.
        </motion.p>
      )}

      {/* Progress Chart */}
      <div className="my-6 flex flex-1 items-center">
        <ProgressChart />
      </div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-8 flex w-full max-w-sm items-center justify-center gap-0"
      >
        <div className="flex-1 text-center">
          <div className="text-[36px] font-bold text-white">
            <AnimatedStat target={99} suffix="%" />
          </div>
          <p className="text-[13px] text-white/50">avg. improvement</p>
        </div>
        <div className="h-10 w-px bg-white/10" />
        <div className="flex-1 text-center">
          <div className="text-[36px] font-bold text-white">
            <AnimatedStat target={20} suffix="x" />
          </div>
          <p className="text-[13px] text-white/50">more affordable</p>
        </div>
      </motion.div>

      {/* Continue button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="w-full max-w-sm"
      >
        <OnboardingButton onClick={onNext}>Continue</OnboardingButton>
      </motion.div>
    </div>
  )
}
