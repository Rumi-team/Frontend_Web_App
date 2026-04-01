"use client"

import { useState, useEffect, useCallback, useRef } from "react"

// ── Confetti Burst ──────────────────────────────────────────────────────────

const CONFETTI_COLORS = [
  "#FFD740", "#FF6D00", "#7E57C2", "#26C6DA", "#66BB6A",
  "#FF4081", "#448AFF", "#FFAB40", "#E040FB", "#69F0AE",
]

interface ConfettiParticle {
  id: number
  x: number
  y: number
  color: string
  rotation: number
  scale: number
  delay: number
  duration: number
  shape: "square" | "circle" | "triangle"
}

function ConfettiBurst({ onComplete }: { onComplete: () => void }) {
  const [particles] = useState<ConfettiParticle[]>(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: 40 + Math.random() * 20, // center area (40-60% of width)
      y: -5 - Math.random() * 10,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 1,
      delay: Math.random() * 0.6,
      duration: 1.5 + Math.random() * 2,
      shape: (["square", "circle", "triangle"] as const)[Math.floor(Math.random() * 3)],
    }))
  )

  useEffect(() => {
    const timer = setTimeout(onComplete, 3500)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotation}deg) scale(${p.scale})`,
          }}
        >
          {p.shape === "square" && (
            <div style={{ width: 10, height: 10, background: p.color, borderRadius: 2 }} />
          )}
          {p.shape === "circle" && (
            <div style={{ width: 8, height: 8, background: p.color, borderRadius: "50%" }} />
          )}
          {p.shape === "triangle" && (
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                borderBottom: `10px solid ${p.color}`,
              }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ── XP / Insight Popup ──────────────────────────────────────────────────────

function InsightPopup({
  text,
  points,
  onComplete,
}: {
  text: string
  points: number
  onComplete: () => void
}) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2200)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="pointer-events-none fixed inset-0 z-[61] flex items-center justify-center">
      <div className="animate-insight-popup flex flex-col items-center gap-2">
        <div
          className="rounded-full px-8 py-3 text-2xl font-bold shadow-xl"
          style={{
            background: "linear-gradient(135deg, #FFD740, #FF9100)",
            color: "#3D1F00",
            boxShadow: "0 0 30px rgba(255, 215, 64, 0.5)",
          }}
        >
          +{points} {text}
        </div>
      </div>
    </div>
  )
}

// ── Star Burst ──────────────────────────────────────────────────────────────

function StarBurst({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1500)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="pointer-events-none fixed inset-0 z-[59] flex items-center justify-center">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-star-burst"
          style={{
            animationDelay: `${i * 0.06}s`,
            transform: `rotate(${i * 45}deg)`,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path
              d="M12 2 L14 9 L22 9 L16 14 L18 22 L12 17 L6 22 L8 14 L2 9 L10 9 Z"
              fill="#FFD740"
              opacity="0.9"
            />
          </svg>
        </div>
      ))}
    </div>
  )
}

// ── Golden Screen Flash ─────────────────────────────────────────────────────

function GoldenFlash({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 800)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[58] animate-golden-flash"
      style={{
        background: "radial-gradient(circle at center, rgba(255,215,64,0.25) 0%, transparent 70%)",
      }}
    />
  )
}

// ── Streak Flame ────────────────────────────────────────────────────────────

export function StreakBadge({ count }: { count: number }) {
  if (count < 2) return null

  return (
    <div className="flex items-center gap-1.5 rounded-full px-4 py-1.5 animate-streak-pulse"
      style={{
        background: "linear-gradient(135deg, #FF6D00, #FF9100)",
        boxShadow: "0 0 16px rgba(255, 109, 0, 0.4)",
      }}
    >
      <span className="text-lg">&#x1F525;</span>
      <span className="text-base font-bold text-white">{count} day streak</span>
    </div>
  )
}

// ── Celebration Pools (randomized each time) ────────────────────────────────

const INSIGHT_POOL = [
  { text: "Great Insight!", points: 5 },
  { text: "Self-Awareness!", points: 8 },
  { text: "Clarity!", points: 10 },
  { text: "Deep Reflection!", points: 7 },
  { text: "Nice Connection!", points: 6 },
  { text: "Key Realization!", points: 9 },
]

const BREAKTHROUGH_POOL = [
  { text: "Breakthrough!", points: 15 },
  { text: "Transformation!", points: 20 },
  { text: "Growth!", points: 18 },
  { text: "Discovery!", points: 22 },
  { text: "Awakening!", points: 25 },
  { text: "Shift!", points: 17 },
]

const MILESTONE_POOL = [
  { text: "Milestone!", points: 40 },
  { text: "Evolution!", points: 50 },
  { text: "Transcendence!", points: 55 },
  { text: "Mastery!", points: 45 },
]

function pickRandom<T>(pool: T[]): T {
  return pool[Math.floor(Math.random() * pool.length)]
}

// ── Main Celebration Controller ─────────────────────────────────────────────

export type CelebrationLevel = "spark" | "insight" | "breakthrough" | "milestone"

interface CelebrationState {
  confetti: boolean
  insightPopup: { text: string; points: number } | null
  starBurst: boolean
  goldenFlash: boolean
}

export function useCelebration() {
  const [state, setState] = useState<CelebrationState>({
    confetti: false,
    insightPopup: null,
    starBurst: false,
    goldenFlash: false,
  })
  const [streak, setStreak] = useState(0)
  const streakTimerRef = useRef<ReturnType<typeof setTimeout>>()

  // Reset streak after 60s of no celebrations
  const bumpStreak = useCallback(() => {
    setStreak((s) => s + 1)
    if (streakTimerRef.current) clearTimeout(streakTimerRef.current)
    streakTimerRef.current = setTimeout(() => setStreak(0), 60000)
  }, [])

  const celebrate = useCallback(
    (level: CelebrationLevel) => {
      bumpStreak()
      switch (level) {
        case "spark":
          // Small sparkle — highlighted text detected
          setState((s) => ({ ...s, goldenFlash: true }))
          break
        case "insight": {
          // Medium — good point or aha moment
          const pick = pickRandom(INSIGHT_POOL)
          setState((s) => ({
            ...s,
            starBurst: true,
            insightPopup: pick,
            goldenFlash: true,
          }))
          break
        }
        case "breakthrough": {
          // Big — step completed
          const pick = pickRandom(BREAKTHROUGH_POOL)
          setState((s) => ({
            ...s,
            confetti: true,
            starBurst: true,
            insightPopup: pick,
            goldenFlash: true,
          }))
          break
        }
        case "milestone": {
          // Huge — day or program complete
          const pick = pickRandom(MILESTONE_POOL)
          setState((s) => ({
            ...s,
            confetti: true,
            starBurst: true,
            insightPopup: pick,
            goldenFlash: true,
          }))
          break
        }
      }
    },
    [bumpStreak]
  )

  const clear = useCallback((key: keyof CelebrationState) => {
    setState((s) => ({ ...s, [key]: key === "insightPopup" ? null : false }))
  }, [])

  return { state, streak, celebrate, clear }
}

// ── Celebration Renderer ────────────────────────────────────────────────────

export function CelebrationEffects({
  state,
  onClear,
}: {
  state: CelebrationState
  onClear: (key: keyof CelebrationState) => void
}) {
  return (
    <>
      {state.goldenFlash && <GoldenFlash onComplete={() => onClear("goldenFlash")} />}
      {state.starBurst && <StarBurst onComplete={() => onClear("starBurst")} />}
      {state.confetti && <ConfettiBurst onComplete={() => onClear("confetti")} />}
      {state.insightPopup && (
        <InsightPopup
          text={state.insightPopup.text}
          points={state.insightPopup.points}
          onComplete={() => onClear("insightPopup")}
        />
      )}
    </>
  )
}
