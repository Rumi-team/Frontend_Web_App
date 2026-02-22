"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  MessageSquareText,
  BookOpen,
  UserCog,
  Mail,
  Shield,
  Brain,
  Target,
  ArrowRight,
  ChevronDown,
  Clock,
  TrendingUp,
  Lock,
  RefreshCw,
  Heart,
  Award,
  ClipboardCheck,
  Sliders,
  LineChart,
  BellRing,
  Layers,
} from "lucide-react"
import { ContactModal } from "@/components/contact-modal"

/* ═══════════════════════════════════════════════════════════
   Scroll Reveal Hook
   ═══════════════════════════════════════════════════════════ */
function useScrollReveal(threshold = 0.15) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold])

  return { ref, isVisible }
}

/* ═══════════════════════════════════════════════════════════
   Reveal Section Wrapper
   ═══════════════════════════════════════════════════════════ */
function RevealSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const { ref, isVisible } = useScrollReveal()
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Animated Stat
   ═══════════════════════════════════════════════════════════ */
function AnimatedStat({
  label,
  value,
  suffix = "",
  prefix = "",
  description,
  icon: Icon,
}: {
  label: string
  value: string
  suffix?: string
  prefix?: string
  description: string
  icon: React.ElementType
}) {
  return (
    <div className="flex flex-col items-center text-center p-6 md:p-8">
      <Icon className="h-8 w-8 text-yellow-400 mb-4" />
      <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 whitespace-nowrap">
        {prefix}
        {value}
        {suffix}
      </div>
      <div className="text-yellow-400 font-semibold text-sm uppercase tracking-wider mb-1">{label}</div>
      <p className="text-gray-400 text-sm max-w-[200px]">{description}</p>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Rotating Words (hero animation)
   ═══════════════════════════════════════════════════════════ */
type RotatingWordsProps = {
  onComplete?: () => void
  onMobilePhaseChange?: (phase: "text" | "image") => void
}

function RotatingWords({ onComplete, onMobilePhaseChange }: RotatingWordsProps) {
  const [currentFace, setCurrentFace] = useState(0)
  const [animationComplete, setAnimationComplete] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobilePhase, setMobilePhase] = useState<"text" | "hidden">("text")
  const completionScheduled = useRef(false)
  const mobileRevealTriggered = useRef(false)
  const topLine = "Your"
  const bottomLine1 = "Transformational"
  const bottomLine2 = "Leader"
  const rotatingWords = useMemo(() => ["Personal", "Unbiased", "Confidential"], [])

  useEffect(() => {
    const updateIsMobile = () => {
      if (typeof window === "undefined") {
        return
      }
      setIsMobile(window.innerWidth < 768)
    }

    updateIsMobile()
    window.addEventListener("resize", updateIsMobile)
    return () => window.removeEventListener("resize", updateIsMobile)
  }, [])

  useEffect(() => {
    setCurrentFace(0)
    setAnimationComplete(false)
    completionScheduled.current = false
    mobileRevealTriggered.current = false
    setMobilePhase("text")
    onMobilePhaseChange?.("text")
  }, [isMobile, onMobilePhaseChange])

  useEffect(() => {
    if (isMobile && mobilePhase !== "text") {
      return
    }
    if (animationComplete) {
      return
    }

    const interval = setInterval(() => {
      setCurrentFace((prev) => {
        const nextFace = (prev + 1) % rotatingWords.length

        if (nextFace === rotatingWords.length - 1) {
          setAnimationComplete(true)
          clearInterval(interval)
        }

        return nextFace
      })
    }, 1500)

    return () => clearInterval(interval)
  }, [animationComplete, isMobile, mobilePhase, rotatingWords])

  useEffect(() => {
    if (!animationComplete || completionScheduled.current) {
      return
    }

    if (isMobile) {
      const revealTimer = setTimeout(() => {
        if (mobileRevealTriggered.current) {
          return
        }
        mobileRevealTriggered.current = true
        setMobilePhase("hidden")
        onMobilePhaseChange?.("image")
      }, 2000)

      const completionTimer = setTimeout(() => {
        completionScheduled.current = true
        onComplete?.()
      }, 2800)

      return () => {
        clearTimeout(revealTimer)
        clearTimeout(completionTimer)
      }
    }

    const timer = setTimeout(() => {
      completionScheduled.current = true
      onComplete?.()
    }, 1500)

    return () => clearTimeout(timer)
  }, [animationComplete, isMobile, onComplete, onMobilePhaseChange])

  return (
    <>
      <style jsx>{`
        .word-anim {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          animation: growWord 0.9s ease forwards;
          will-change: transform, opacity;
          transform-origin: center center;
        }
        @keyframes growWord {
          from {
            transform: perspective(700px) translateZ(-120px) scale(0.7);
            opacity: 0;
          }
          to {
            transform: perspective(700px) translateZ(0) scale(1);
            opacity: 1;
          }
        }
        .text-giant {
          font-size: clamp(1.8rem, 9vw, 4.8rem);
          line-height: 0.95;
        }
      `}</style>
      {isMobile ? (
        <div
          className="w-full h-full flex items-center justify-center px-6 text-center font-bold"
          aria-hidden={mobilePhase !== "text"}
        >
          <div className="flex flex-col items-center text-giant" style={{ gap: "clamp(0.6rem, 3vw, 1.5rem)" }}>
            <span className="text-white">{topLine}</span>
            <span
              key={`${currentFace}-${rotatingWords[currentFace]}`}
              className="word-anim text-yellow-400 whitespace-nowrap"
            >
              {rotatingWords[currentFace]}
            </span>
            <span className="text-white">{bottomLine1}</span>
            <span className="text-white">{bottomLine2}</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center text-yellow-400 font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl space-y-6 leading-tight text-center">
          <span className="text-white">{topLine}</span>
          <div className="relative h-20 w-full flex items-center justify-center text-yellow-400">
            <span
              key={`${currentFace}-${rotatingWords[currentFace]}`}
              className="word-anim absolute inset-0 flex items-center justify-center px-2 whitespace-nowrap"
            >
              {rotatingWords[currentFace]}
            </span>
          </div>
          <span className="text-white">Transformational</span>
          <span className="text-white">Leader</span>
        </div>
      )}
    </>
  )
}

/* ═══════════════════════════════════════════════════════════
   Partner Logos
   ═══════════════════════════════════════════════════════════ */
function GoogleCloudLogo() {
  return (
    <div className="flex flex-col items-center gap-4 group">
      <div className="h-16 md:h-20 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity duration-300">
        <svg viewBox="0 0 256 206" className="h-full w-auto" aria-label="Google Cloud">
          <path
            d="M170.252 56.819l22.253-22.253 1.483-9.37C171.96-1.583 137.06-8.57 104.512 4.416 81.666 13.825 62.951 31.13 51.804 52.292l8.016-1.105 44.505-7.34s2.267-3.767 3.43-3.552c17.865-19.586 44.063-25.757 67.588-17.953"
            fill="#EA4335"
          />
          <path
            d="M224.205 73.918a100.249 100.249 0 00-30.217-48.722l-31.232 31.232a55.515 55.515 0 0120.377 44.084v5.556c15.378 0 27.834 12.456 27.834 27.834 0 15.378-12.456 27.834-27.834 27.834h-55.669l-5.556 5.556v33.391l5.556 5.556h55.669c40.16.388 73.053-31.806 73.441-71.966.22-22.94-10.416-44.626-28.37-58.89"
            fill="#4285F4"
          />
          <path
            d="M72.008 206.091h55.669v-44.505H72.008c-3.973 0-7.895-.86-11.536-2.527l-8.015 2.453-22.357 22.253-1.98 7.633C41.769 200.303 56.605 206.1 72.008 206.091"
            fill="#34A853"
          />
          <path
            d="M72.008 62.005C31.849 62.168-1.066 95.242-.882 135.401c.104 22.696 10.783 44.047 28.928 57.862l32.352-32.352c-13.954-6.32-20.156-22.63-13.836-36.584 6.32-13.954 22.63-20.156 36.584-13.836a27.834 27.834 0 0113.836 13.836l32.352-32.352C116.328 77.06 94.793 62.34 72.008 62.005"
            fill="#FBBC05"
          />
        </svg>
      </div>
      <span className="text-gray-400 text-xs md:text-sm font-medium tracking-widest uppercase">Google Cloud</span>
    </div>
  )
}

function FounderInstituteLogo() {
  return (
    <div className="flex flex-col items-center gap-4 group">
      <div className="h-48 md:h-64 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity duration-300">
        <Image
          src="/founder-institute-logo.png"
          alt="Founder Institute"
          width={500}
          height={200}
          className="h-40 md:h-56 w-auto"
        />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Solution Card
   ═══════════════════════════════════════════════════════════ */
function SolutionCard({
  title,
  problem,
  solution,
  icon: Icon,
  delay = 0,
}: {
  title: string
  problem: string
  solution: string
  icon: React.ElementType
  delay?: number
}) {
  return (
    <RevealSection delay={delay}>
      <div className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm p-8 md:p-10 hover:border-yellow-400/30 transition-all duration-500 hover:bg-white/[0.04] h-full">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-yellow-400/10 border border-yellow-400/20">
              <Icon className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-yellow-300 mb-3">{title}</h3>
          <div className="mb-4">
            <p className="text-gray-400 text-base leading-relaxed">{problem}</p>
          </div>
          <div className="border-t border-white/[0.06] pt-4 mt-4">
            <div className="flex items-start gap-3">
              <ArrowRight className="h-5 w-5 text-yellow-400 mt-0.5 shrink-0" />
              <p className="text-white text-base md:text-lg leading-relaxed font-medium">{solution}</p>
            </div>
          </div>
        </div>
      </div>
    </RevealSection>
  )
}

/* ═══════════════════════════════════════════════════════════
   Main Page Component
   ═══════════════════════════════════════════════════════════ */
export default function Home() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [isCubeComplete, setIsCubeComplete] = useState(false)
  const [mobileHeroPhase, setMobileHeroPhase] = useState<"text" | "image">("text")
  const cubeCompleteTimeout = useRef<NodeJS.Timeout | null>(null)

  const handleCubeComplete = useCallback(() => {
    if (cubeCompleteTimeout.current) {
      clearTimeout(cubeCompleteTimeout.current)
    }
    cubeCompleteTimeout.current = setTimeout(() => setIsCubeComplete(true), 3000)
  }, [])

  useEffect(
    () => () => {
      if (cubeCompleteTimeout.current) {
        clearTimeout(cubeCompleteTimeout.current)
      }
    },
    []
  )

  return (
    <div
      className="flex flex-col min-h-screen bg-black text-white"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* ══════════════════════════════════════════════════════
          HEADER
          ══════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-black/80 backdrop-blur-xl">
        <div className="flex items-center justify-between w-full h-16 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/rumi_logo.png"
                alt="Rumi Logo"
                width={607}
                height={202}
                priority
                className="h-[56px] w-auto"
              />
            </Link>
          </div>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-10">
            <Link href="#solutions" className="text-lg text-gray-400 hover:text-white transition-colors duration-200">
              Solutions
            </Link>
            <Link href="#partners" className="text-lg text-gray-400 hover:text-white transition-colors duration-200">
              Partners
            </Link>
            <Link href="#how-it-works" className="text-lg text-gray-400 hover:text-white transition-colors duration-200">
              How It Works
            </Link>
          </nav>
          <div className="flex items-center">
            <Link href="/login">
              <Button className="bg-yellow-400 text-black hover:bg-yellow-300 font-semibold text-base px-8 h-11 transition-all duration-300 hover:shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ══════════════════════════════════════════════════════
            SECTION 1 — HERO
            ══════════════════════════════════════════════════════ */}
        <section
          id="hero"
          className="w-full min-h-screen flex flex-col items-center justify-center pt-6 md:pt-12 bg-black text-white relative overflow-hidden"
        >
          {/* Subtle radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.06)_0%,transparent_60%)] pointer-events-none" />

          <div className="w-full px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center justify-center">

              {/* ── Desktop layout: iPhone | Center | Web ── */}
              <div className="hidden md:flex items-center justify-center max-w-6xl mx-auto gap-6 lg:gap-8">
                {/* iPhone — left */}
                <div className={`shrink-0 w-[200px] lg:w-[240px] flex items-center justify-end transition-transform duration-1000 ease-in-out ${isCubeComplete ? "translate-x-32 lg:translate-x-48" : ""}`}>
                  <div className="relative isolate">
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[90%] bg-yellow-400/20 blur-[30px] lg:blur-[40px] rounded-[30px] transition-opacity duration-1000 select-none pointer-events-none ${isCubeComplete ? "opacity-100" : "opacity-0"}`} />
                    <div className={`transition-all duration-500 bg-transparent relative z-10`}>
                      <Image
                        src="/app_landing_page.png"
                        alt="Rumi iOS app"
                        width={300}
                        height={600}
                        className={`rounded-2xl object-contain h-[340px] lg:h-[420px] w-auto`}
                        priority
                      />
                    </div>
                  </div>
                </div>

                {/* Center area — rotating text then lock animation */}
                <div className="flex-1 min-w-0 flex items-center justify-center relative">
                  {/* Rotating text — fades out */}
                  <div
                    className={`transition-opacity duration-[800ms] ease-in-out ${isCubeComplete ? "opacity-0 pointer-events-none" : "opacity-100"
                      }`}
                  >
                    <RotatingWords onComplete={handleCubeComplete} />
                  </div>

                  {/* Lock icon — crossfades in where the rotating word was */}
                  <div
                    className={`absolute inset-0 flex items-center justify-center transition-opacity duration-[800ms] ease-in-out ${isCubeComplete ? "opacity-100" : "opacity-0 pointer-events-none"
                      }`}
                    style={{ transitionDelay: isCubeComplete ? "400ms" : "0ms" }}
                  >
                    <Lock className={`h-16 w-16 lg:h-20 lg:w-20 text-yellow-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.4)] ${isCubeComplete ? "lock-anim" : ""}`} />
                  </div>
                </div>

                {/* Web screenshot — right */}
                <div className={`shrink-0 transition-transform duration-1000 ease-in-out ${isCubeComplete ? "-translate-x-32 lg:-translate-x-48" : ""}`}>
                  <div className="relative isolate">
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[95%] bg-yellow-400/20 blur-[30px] lg:blur-[40px] rounded-[30px] transition-opacity duration-1000 select-none pointer-events-none ${isCubeComplete ? "opacity-100" : "opacity-0"}`} />
                    <div className={`rounded-xl overflow-hidden bg-black w-[200px] lg:w-[240px] transition-all duration-500 relative z-10 border border-white/[0.05]`}>
                      {/* Browser chrome bar */}
                      <div className="flex items-center gap-1.5 px-3 py-2 bg-black border-b border-white/[0.04]">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                        <div className="flex-1 mx-2 h-5 rounded bg-white/[0.03] flex items-center justify-center">
                          <span className="text-[10px] text-gray-600">rumi.team</span>
                        </div>
                      </div>
                      <Image
                        src="/app_web.png"
                        alt="Rumi Web app"
                        width={800}
                        height={500}
                        className="object-cover object-center h-[310px] lg:h-[390px] w-full"
                        priority
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Mobile layout ── */}
              <div className="md:hidden flex flex-col items-center justify-center w-full min-h-[400px]">

                {/* Text section — shrinks hide and fades when complete */}
                <div
                  className={`w-full flex justify-center px-4 transition-all duration-1000 ease-in-out overflow-hidden ${isCubeComplete ? "opacity-0 h-0" : "opacity-100 h-[220px]"
                    }`}
                >
                  <RotatingWords onComplete={handleCubeComplete} onMobilePhaseChange={setMobileHeroPhase} />
                </div>

                {/* Mobile images — now always visible, and smoothly slide closer */}
                <div
                  className={`flex items-center justify-center transition-all duration-1000 ease-in-out relative ${isCubeComplete ? "gap-2 scale-100 translate-y-0" : "gap-12 scale-[0.85] -translate-y-4"
                    }`}
                >
                  {/* Center lock for mobile — crossfades in */}
                  <div
                    className={`absolute inset-0 flex items-center justify-center z-20 pointer-events-none transition-opacity duration-[800ms] ease-in-out ${isCubeComplete ? "opacity-100" : "opacity-0"
                      }`}
                    style={{ transitionDelay: isCubeComplete ? "400ms" : "0ms" }}
                  >
                    <Lock className={`h-12 w-12 text-yellow-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)] ${isCubeComplete ? "lock-anim" : ""}`} />
                  </div>

                  {/* iPhone */}
                  <div className="shrink-0 relative isolate">
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[90%] bg-yellow-400/20 blur-[25px] rounded-[30px] transition-opacity duration-1000 select-none pointer-events-none ${isCubeComplete ? "opacity-100" : "opacity-0"}`} />
                    <div className={`transition-all duration-500 relative z-10`}>
                      <Image
                        src="/app_landing_page.png"
                        alt="Rumi iOS app"
                        width={200}
                        height={400}
                        className={`rounded-xl object-contain h-[260px] w-auto`}
                        priority
                      />
                    </div>
                  </div>
                  {/* Web */}
                  <div className="shrink-0 relative isolate">
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[95%] bg-yellow-400/20 blur-[25px] rounded-[30px] transition-opacity duration-1000 select-none pointer-events-none ${isCubeComplete ? "opacity-100" : "opacity-0"}`} />
                    <div className={`rounded-lg overflow-hidden bg-black w-[140px] transition-all duration-500 relative z-10 border border-white/[0.05]`}>
                      <div className="flex items-center gap-1 px-2 py-1.5 bg-black border-b border-white/[0.04]">
                        <div className="w-2 h-2 rounded-full bg-red-500/60" />
                        <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
                        <div className="w-2 h-2 rounded-full bg-green-500/60" />
                        <div className="flex-1 mx-1 h-4 rounded bg-white/[0.03] flex items-center justify-center">
                          <span className="text-[8px] text-gray-600">rumi.team</span>
                        </div>
                      </div>
                      <Image
                        src="/app_web.png"
                        alt="Rumi Web app"
                        width={400}
                        height={250}
                        className="object-cover object-center h-[230px] w-full"
                        priority
                      />
                    </div>
                  </div>
                </div>

                {/* Mobile platform labels */}
                <div
                  className={`flex items-center justify-center gap-[110px] mt-4 transition-all duration-700 ${isCubeComplete ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 -translate-y-4"
                    }`}
                >
                  <span className="text-gray-500 text-[10px] font-medium tracking-widest uppercase">iOS</span>
                  <span className="text-gray-500 text-[10px] font-medium tracking-widest uppercase">Web</span>
                </div>
              </div>

              {/* Spacer after animation completes */}
              <div className="mt-8 md:mt-12" />
            </div>
          </div>

          {/* Scroll indicator */}
          <div
            className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-opacity duration-1000 ${isCubeComplete ? "opacity-100" : "opacity-0"
              }`}
          >
            <div className="scroll-indicator text-gray-600">
              <ChevronDown className="h-6 w-6" />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 2 — TRANSFORMATIONAL LEADERS
            ══════════════════════════════════════════════════════ */}
        <section className="w-full py-24 md:py-32 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.03)_0%,transparent_60%)] pointer-events-none" />

          <div className="relative z-10 w-full max-w-5xl mx-auto px-4 md:px-8">
            <RevealSection>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                  The World&apos;s Greatest{" "}
                  <span className="gradient-text">Transformational Leaders</span>
                </h2>
              </div>
            </RevealSection>

            <RevealSection delay={200}>
              <div className="flex items-center justify-center gap-8 md:gap-16 lg:gap-20">
                {[
                  { src: "/leaders/mandela.jpg", alt: "Transformational leader" },
                  { src: "/leaders/gandhi.jpg", alt: "Transformational leader" },
                  { src: "/leaders/lincoln.jpg", alt: "Transformational leader" },
                  { src: "/leaders/rumi.jpg", alt: "Transformational leader" },
                ].map((leader) => (
                  <div key={leader.src} className="relative">
                    <div className="w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden border-2 border-white/10 hover:border-yellow-400/40 transition-all duration-500">
                      <Image
                        src={leader.src}
                        alt={leader.alt}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </RevealSection>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 3 — INSPIRED BY
            ══════════════════════════════════════════════════════ */}
        <section id="inspired" className="w-full py-24 md:py-32 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.04)_0%,transparent_60%)] pointer-events-none" />

          <div className="relative z-10 w-full max-w-4xl mx-auto px-4 md:px-8">
            <RevealSection>
              <div className="text-center">
                <span className="inline-block text-yellow-400 text-sm font-semibold tracking-widest uppercase mb-4">
                  Standing on the Shoulders of Giants
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight mb-6">
                  Transformational programs proved, transformation is teachable.
                  <br />
                  <span className="gradient-text">We made it affordable for all.</span>
                </h2>
                <p className="text-gray-400 text-base md:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed">
                  Inspired by the world&apos;s most impactful programs — Landmark Forum &amp; Tony Robbins
                  — and reimagined with AI that can actually deliver transformation in your pocket.
                </p>
              </div>
            </RevealSection>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 3 — THREE SOLUTIONS
            ══════════════════════════════════════════════════════ */}
        <section id="solutions" className="w-full py-24 md:py-32 lg:py-40 bg-black relative overflow-hidden">
          <div className="absolute inset-0 dot-pattern opacity-50 pointer-events-none" />

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8">
            <RevealSection>
              <div className="text-center mb-16 md:mb-20">
                <span className="inline-block text-yellow-400 text-sm font-semibold tracking-widest uppercase mb-4">
                  Why Rumi Exists
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight mb-6">
                  Become a Transformational Leader.{" "}
                  <span className="gradient-text">10X Cheaper. 10X More Permanent.</span>
                </h2>
              </div>
            </RevealSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
              <SolutionCard
                title="Lead Without the Financial Barrier"
                icon={Lock}
                problem="World-class transformational programs require a large upfront commitment of $1,000–$12,000, plus 3–5 days of participation with an average of 12 hours of seat time per day."
                solution="Rumi delivers the same depth of transformational leadership — accessible anytime, anywhere, right from your phone. No travel, no time off work."
                delay={0}
              />
              <SolutionCard
                title="Become the Leader. Stay the Leader."
                icon={RefreshCw}
                problem="Although you are highly likely to experience a breakthrough that truly excites you, recent research shows that for about 95% of participants, the breakthrough is not permanent and will revert back."
                solution="Rumi's reinforcement engine evaluates every session, creates personalized assignments, and holds you accountable — turning fleeting insights into permanent transformation."
                delay={150}
              />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 3 — PARTNERS
            ══════════════════════════════════════════════════════ */}
        <section id="partners" className="w-full py-24 md:py-32 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent" />

          <div className="relative z-10 w-full max-w-5xl mx-auto px-4 md:px-8">
            <RevealSection>
              <div className="text-center mb-16">
                <span className="inline-block text-yellow-400 text-sm font-semibold tracking-widest uppercase mb-4">
                  Backed By
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                  Industry Leaders
                </h2>
                <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto">
                  Built on world-class infrastructure and supported by leading startup programs
                </p>
              </div>
            </RevealSection>

            <RevealSection delay={200}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-16 md:gap-24 lg:gap-32">
                <GoogleCloudLogo />
                <div className="hidden sm:block w-px h-20 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                <FounderInstituteLogo />
              </div>
            </RevealSection>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 5 — HOW IT WORKS (no numbers)
            ══════════════════════════════════════════════════════ */}
        <section id="how-it-works" className="w-full py-24 md:py-32 lg:py-40 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent" />
          <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />

          <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-8">
            <RevealSection>
              <div className="text-center mb-16 md:mb-20">
                <span className="inline-block text-yellow-400 text-sm font-semibold tracking-widest uppercase mb-4">
                  How It Works
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight mb-6">
                  Your Transformation in{" "}
                  <span className="gradient-text">Three Steps</span>
                </h2>
              </div>
            </RevealSection>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-10">
              {/* Step 1 */}
              <RevealSection delay={0}>
                <div className="relative text-center md:text-left">
                  <div className="flex flex-col items-center md:items-start">
                    <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mb-6">
                      <MessageSquareText className="h-7 w-7 text-yellow-400" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-3 relative z-10">
                      Start a Conversation
                    </h3>
                    <p className="text-gray-400 text-base leading-relaxed relative z-10">
                      Tell Rumi what&apos;s on your mind. Your AI transformational leader listens deeply — no judgment, no agenda, no time limits. Available 24/7 whenever you need it.
                    </p>
                  </div>
                  <div className="hidden md:block absolute top-8 right-0 w-1/3 h-px bg-gradient-to-r from-yellow-400/20 to-transparent translate-x-full" />
                </div>
              </RevealSection>

              {/* Step 2 */}
              <RevealSection delay={200}>
                <div className="relative text-center md:text-left">
                  <div className="flex flex-col items-center md:items-start">
                    <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mb-6">
                      <Brain className="h-7 w-7 text-yellow-400" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-3 relative z-10">
                      Uncover What&apos;s Holding You Back
                    </h3>
                    <p className="text-gray-400 text-base leading-relaxed relative z-10">
                      Rumi surfaces the hidden beliefs, emotional reactions, and habitual patterns that shape your life — then measures the depth of your breakthrough in real-time.
                    </p>
                  </div>
                </div>
              </RevealSection>

              {/* Step 3 */}
              <RevealSection delay={400}>
                <div className="relative text-center md:text-left">
                  <div className="flex flex-col items-center md:items-start">
                    <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mb-6">
                      <Target className="h-7 w-7 text-yellow-400" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-3 relative z-10">
                      Transform — and Stay Transformed
                    </h3>
                    <p className="text-gray-400 text-base leading-relaxed relative z-10">
                      Personalized assignments, daily check-ins, and transformation scoring ensure your insights become permanent behavioral shifts — not another forgotten seminar.
                    </p>
                  </div>
                </div>
              </RevealSection>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 6 — STATS / VALUE PROPS (no price, updated)
            ══════════════════════════════════════════════════════ */}
        <section className="w-full py-24 md:py-32 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent" />

          <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-8">
            <RevealSection>
              <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden glow-yellow">
                <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/[0.06]">
                  <AnimatedStat
                    icon={Clock}
                    value="24/7"
                    label="Always There"
                    description="Transformational leadership whenever you need it most"
                  />
                  <AnimatedStat
                    icon={TrendingUp}
                    value="Self-Paced"
                    label="Your Schedule"
                    description="Progress at your own speed, on your own terms"
                  />
                  <AnimatedStat
                    icon={Brain}
                    value="Agentic AI"
                    label="First for Human Development"
                    description="Evaluates, assigns, adapts, and holds you accountable"
                  />
                  <AnimatedStat
                    icon={Shield}
                    value="100%"
                    label="Secured"
                    description="Your data is never shared with third parties"
                  />
                </div>
              </div>
            </RevealSection>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 7 — FEATURES GRID (with all reinforcement layers)
            ══════════════════════════════════════════════════════ */}
        <section className="w-full py-24 md:py-32 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent" />
          <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />

          <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-8">
            <RevealSection>
              <div className="text-center mb-16 md:mb-20">
                <span className="inline-block text-yellow-400 text-sm font-semibold tracking-widest uppercase mb-4">
                  Platform Features
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                  Everything You Need to Experience a{" "}
                  <span className="gradient-text whitespace-nowrap">Lasting Transformation</span>
                </h2>
              </div>
            </RevealSection>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: MessageSquareText,
                  title: "AI-Powered Conversations",
                  desc: "Real-time, natural dialogue with an AI transformational leader that listens, reflects, and responds with genuine emotional intelligence — available 24/7.",
                },
                {
                  icon: BookOpen,
                  title: "Proven Transformational Programs",
                  desc: "Structured programs built on decades of proven transformational frameworks, delivered as guided journeys with clear milestones and measurable outcomes.",
                },
                {
                  icon: UserCog,
                  title: "Hyper Personalization",
                  desc: "Learns your character, goals, and mood over time — adapting every session to your unique patterns and growth edge.",
                },
                {
                  icon: Heart,
                  title: "Emotional Intelligence",
                  desc: "Detects emotional tone and context in real-time, adjusting its approach to meet you exactly where you are emotionally.",
                },
                {
                  icon: Award,
                  title: "Transformation Scoring",
                  desc: "After every session, Rumi evaluates your progress with a multi-dimensional transformation score — tracking real breakthroughs, not just attendance.",
                },
                {
                  icon: ClipboardCheck,
                  title: "Smart Assignments",
                  desc: "Personalized action items created exactly when you need them — with deadlines, accountability, and completion tracking that drive real change.",
                },
                {
                  icon: Sliders,
                  title: "Adaptive Leadership Style",
                  desc: "Dynamically adjusts its approach based on what actually works for you — pacing, technique, and intensity evolve with every session.",
                },
                {
                  icon: LineChart,
                  title: "Growth Trajectory",
                  desc: "Track your transformation journey over weeks and months. See plateaus before they happen, celebrate milestones, and watch your growth unfold.",
                },
                {
                  icon: BellRing,
                  title: "Proactive Accountability",
                  desc: "Rumi doesn't wait for you to show up. Check-ins, reminders, and accountability nudges keep your momentum strong between sessions.",
                },
                {
                  icon: Layers,
                  title: "Multiple Growth Journeys",
                  desc: "Specialized transformational programs for different areas of your life — each with its own milestones, assignments, and progression path.",
                },
                {
                  icon: Target,
                  title: "Accountability System",
                  desc: "Daily check-ins, progress tracking, and reflective prompts that keep you on track and turn insights into lasting behavioral shifts.",
                },
                {
                  icon: Shield,
                  title: "Your Data Stays Yours",
                  desc: "Your conversations are completely confidential. Your data is never shared with third parties. Built on Google Cloud with enterprise-grade security.",
                },
              ].map((feature, i) => (
                <RevealSection key={feature.title} delay={i * 100}>
                  <div className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 md:p-8 hover:border-yellow-400/20 transition-all duration-500 h-full">
                    <feature.icon className="h-8 w-8 text-yellow-400 mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                </RevealSection>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 8 — CTA BANNER
            ══════════════════════════════════════════════════════ */}
        <section className="w-full py-24 md:py-32 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.06)_0%,transparent_60%)] pointer-events-none" />

          <div className="relative z-10 w-full max-w-4xl mx-auto px-4 md:px-8 text-center">
            <RevealSection>
              <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight mb-6">
                Ready to Meet the Transformational Leader{" "}
                <span className="gradient-text">Who Truly Knows You?</span>
              </h2>
              <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-4">
                Experience transformational leadership that understands who you are, meets you where you are,
                and helps you become who you want to be.
              </p>
              <div className="flex items-center justify-center gap-2 mb-10">
                <Shield className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-gray-500">Your privacy is our priority. Data never shared with third parties.</span>
              </div>
              <Link href="/login">
                <Button className="bg-yellow-400 text-black hover:bg-yellow-300 font-semibold text-lg px-10 h-14 transition-all duration-300 hover:shadow-[0_0_40px_rgba(251,191,36,0.3)]">
                  Sign In
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </RevealSection>
          </div>
        </section>
      </main>

      {/* ══════════════════════════════════════════════════════
          FOOTER
          ══════════════════════════════════════════════════════ */}
      <footer className="w-full py-12 bg-black border-t border-white/[0.06]">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start gap-2">
              <Image src="/rumi_logo.png" alt="Rumi Logo" width={607} height={202} className="h-[64px] w-auto opacity-70" />
              <span className="text-base text-gray-500">Designed in California</span>
            </div>
            <div className="text-center">
              <p className="text-base text-gray-500">
                Copyright &copy;2026, Rumi, Inc. Los Angeles, California. All rights reserved.
              </p>
            </div>
            <div>
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="inline-flex items-center text-lg text-gray-500 hover:text-yellow-400 transition-colors duration-200"
              >
                <Mail className="h-7 w-7 mr-2" />
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Contact Modal */}
      <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
    </div>
  )
}
