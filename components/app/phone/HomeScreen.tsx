"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { useUserStore } from "@/store/userStore"
import { useSessionStore } from "@/store/sessionStore"
import Image from "next/image"

// Phase-curated Rumi quotes (from DESIGN.md)
const PHASE_QUOTES: Record<number, { text: string; author: string }[]> = {
  1: [
    { text: "The wound is the place where the Light enters you.", author: "Rumi" },
    { text: "Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.", author: "Rumi" },
  ],
  2: [
    { text: "What you seek is seeking you.", author: "Rumi" },
    { text: "Don't be satisfied with stories, how things have gone with others. Unfold your own myth.", author: "Rumi" },
  ],
  3: [
    { text: "You were born with wings, why prefer to crawl through life?", author: "Rumi" },
    { text: "The only lasting beauty is the beauty of the heart.", author: "Rumi" },
  ],
  4: [
    { text: "Let yourself be silently drawn by the stronger pull of what you really love.", author: "Rumi" },
    { text: "As you start to walk on the way, the way appears.", author: "Rumi" },
  ],
}

function getPhaseFromStep(step: number): number {
  if (step <= 5) return 1
  if (step <= 10) return 2
  if (step <= 15) return 3
  return 4
}

const LEVEL_NAMES = ["Seeker", "Explorer", "Awakener", "Transformer"]

function getDayOfWeekCircles(streak: number) {
  const today = new Date().getDay() // 0=Sun
  const days = ["M", "T", "W", "T", "F", "S", "S"]
  // Map: Mon=0, Tue=1... Sun=6
  const todayIdx = today === 0 ? 6 : today - 1

  return days.map((d, i) => {
    if (i < todayIdx) return { label: d, status: i >= todayIdx - streak ? "done" : "missed" }
    if (i === todayIdx) return { label: d, status: "today" }
    return { label: d, status: "future" }
  })
}

export function HomeScreen() {
  const router = useRouter()
  const { displayName } = useAuth()
  const xp = useUserStore((s) => s.xp)
  const streak = useUserStore((s) => s.streak)
  const startSession = useSessionStore((s) => s.startSession)

  // Get current coaching step (default to 1)
  const currentStep = 1 // TODO: wire from userStore/session state
  const phase = getPhaseFromStep(currentStep)
  const levelName = LEVEL_NAMES[phase - 1]

  // Daily quote rotation per phase
  const quotes = PHASE_QUOTES[phase] || PHASE_QUOTES[1]
  const dayIndex = new Date().getDate() % quotes.length
  const quote = quotes[dayIndex]

  const weekDays = getDayOfWeekCircles(streak)

  const handleStartSession = () => {
    startSession()
    router.replace("/phone/session/loading")
  }

  return (
    <div className="flex flex-col min-h-[calc(100dvh-88px)] bg-[#1A1A1A] px-4 pt-4 pb-4">
      {/* Quote Card */}
      <div className="rounded-[20px] p-5 mb-4" style={{
        background: "linear-gradient(135deg, #F5C518, #E8B400)",
      }}>
        <p className="text-[#1A1A1A] text-lg font-bold italic leading-snug" style={{ fontFamily: "var(--font-nunito, Nunito), sans-serif" }}>
          &ldquo;{quote.text}&rdquo;
        </p>
        <p className="text-[#1A1A1A]/70 text-sm font-semibold mt-2">
          — {quote.author}
        </p>
      </div>

      {/* Mascot greeting */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
          style={{ background: "linear-gradient(135deg, #7B68EE, #9B8FFF)", border: "3px solid #F5C518" }}>
          <Image src="/rumi_mascot.png" alt="Rumi" width={40} height={40} className="rounded-full" />
        </div>
        <div className="flex-1 bg-[#242424] rounded-[14px] rounded-tl-[4px] p-3">
          <p className="text-sm text-white">
            {streak > 0 ? (
              <>Ready for today&apos;s session? You&apos;re on a <span className="font-bold text-[#F5C518]">{streak}-day streak!</span></>
            ) : (
              <>Welcome{displayName ? `, ${displayName}` : ""}! Ready to start your journey?</>
            )}
          </p>
        </div>
      </div>

      {/* Streak card */}
      {streak > 0 && (
        <div className="rounded-[20px] p-4 mb-4 flex items-center gap-4"
          style={{ background: "linear-gradient(135deg, #FF6B35, #FF8C5A)" }}>
          <span className="text-4xl">🔥</span>
          <div className="flex-1">
            <h4 className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-nunito, Nunito), sans-serif" }}>
              {streak} Day Streak!
            </h4>
            <p className="text-white/80 text-xs">
              {streak >= 7 ? "You're on fire! Keep it going." : `${7 - streak} more days to 7-Day Flame badge`}
            </p>
            <div className="flex gap-1.5 mt-2">
              {weekDays.map((day, i) => (
                <div key={i} className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  day.status === "done" ? "bg-white/30 text-white" :
                  day.status === "today" ? "bg-white text-[#FF6B35]" :
                  day.status === "missed" ? "bg-white/10 text-white/30" :
                  "bg-white/10 text-white/40"
                }`}>
                  {day.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Start session button */}
      <button
        onClick={handleStartSession}
        className="w-full py-4 rounded-[14px] text-lg font-extrabold uppercase tracking-wider transition-transform active:translate-y-0.5"
        style={{
          background: "#F5C518",
          color: "#1A1A1A",
          boxShadow: "0 4px 0 #C49B00",
          fontFamily: "var(--font-nunito, Nunito), sans-serif",
        }}
      >
        Start Session
      </button>

      {/* Level indicator */}
      <div className="flex items-center justify-center gap-2 mt-4">
        <span className="text-xs font-bold text-[#7B68EE] bg-[#7B68EE]/20 px-3 py-1 rounded-full">
          {levelName} — Phase {phase}
        </span>
        <span className="text-xs text-[#9E9E9E]">
          Step {currentStep} of 20
        </span>
      </div>
    </div>
  )
}
