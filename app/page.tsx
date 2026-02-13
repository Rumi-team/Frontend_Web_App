"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  MessageSquareText,
  BookOpen,
  UserCog,
  Mail,
  Shield,
  Zap,
  Brain,
  Target,
  ArrowRight,
  ChevronDown,
  Clock,
  TrendingUp,
  Fingerprint,
  Lock,
  RefreshCw,
  Heart,
} from "lucide-react"
import { submitWaitlistEntry, type FormState } from "./actions"
import { ContactModal } from "@/components/contact-modal"

/* ═══════════════════════════════════════════════════════════
   Submit Button
   ═══════════════════════════════════════════════════════════ */
function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      className="w-full bg-yellow-400 text-black hover:bg-yellow-300 text-lg h-14 font-semibold transition-all duration-300 hover:shadow-[0_0_30px_rgba(251,191,36,0.3)]"
      disabled={pending}
    >
      {pending ? "Submitting..." : "Get Early Access"}
    </Button>
  )
}

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
      className={`transition-all duration-1000 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Animated Counter
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
      <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
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
   Rotating Words (original hero animation — preserved)
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
  const bottomLine = "Coach"
  const rotatingWords = useMemo(() => ["Personal", "AI-powered", "Unbiased"], [])

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
    }, 3000)

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
          font-size: clamp(2.75rem, 14vw, 4.8rem);
          line-height: 0.95;
        }
      `}</style>
      {isMobile ? (
        <div
          className="w-full h-full flex items-center justify-center px-6 text-center font-bold"
          aria-hidden={mobilePhase !== "text"}
        >
          <div className="relative w-full max-w-[22rem] aspect-square">
            <span className="absolute top-[4%] left-1/2 -translate-x-1/2 text-white text-giant">{topLine}</span>
            <span
              key={`${currentFace}-${rotatingWords[currentFace]}`}
              className="word-anim absolute inset-0 flex items-center justify-center text-yellow-400 text-giant whitespace-nowrap"
            >
              {rotatingWords[currentFace]}
            </span>
            <span className="absolute bottom-[4%] left-1/2 -translate-x-1/2 text-white text-giant">{bottomLine}</span>
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
          <span className="text-white">{bottomLine}</span>
        </div>
      )}
    </>
  )
}

/* ═══════════════════════════════════════════════════════════
   Partner / Inspiration Logo Components
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
      <div className="h-16 md:h-20 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity duration-300">
        <Image
          src="/fi_logo.svg"
          alt="Founder Institute"
          width={240}
          height={72}
          className="h-14 md:h-16 w-auto"
        />
      </div>
    </div>
  )
}

function LandmarkLogo() {
  return (
    <div className="flex flex-col items-center gap-4 group">
      <div className="h-16 md:h-20 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity duration-300">
        <Image
          src="/landmark_logo.svg"
          alt="Landmark Worldwide"
          width={240}
          height={72}
          className="h-14 md:h-16 w-auto"
        />
      </div>
    </div>
  )
}

function TonyRobbinsLogo() {
  return (
    <div className="flex flex-col items-center gap-4 group">
      <div className="h-16 md:h-20 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity duration-300">
        <Image
          src="/tony_robbins_logo.svg"
          alt="Tony Robbins"
          width={240}
          height={48}
          className="h-10 md:h-12 w-auto"
        />
      </div>
      <span className="text-gray-400 text-xs md:text-sm font-medium tracking-widest uppercase">Transformational Programs</span>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Solution Card
   ═══════════════════════════════════════════════════════════ */
function SolutionCard({
  number,
  problem,
  solution,
  icon: Icon,
  delay = 0,
}: {
  number: string
  problem: string
  solution: string
  icon: React.ElementType
  delay?: number
}) {
  return (
    <RevealSection delay={delay}>
      <div className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm p-8 md:p-10 hover:border-yellow-400/30 transition-all duration-500 hover:bg-white/[0.04] h-full">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-yellow-400/10 border border-yellow-400/20">
              <Icon className="h-6 w-6 text-yellow-400" />
            </div>
            <span className="text-yellow-400/60 text-sm font-mono font-medium">{number}</span>
          </div>
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
  const initialState: FormState = {}
  const [formState, formAction] = useActionState(submitWaitlistEntry, initialState)
  const [showForm, setShowForm] = useState(true)
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

  useEffect(() => {
    if (formState?.success || formState?.alreadyJoined) {
      const timer = setTimeout(() => {
        setShowForm(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [formState?.success, formState?.alreadyJoined])

  return (
    <div
      className="flex flex-col min-h-screen bg-black text-white"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* ── Global Styles ──────────────────────────────────── */}
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
        .perspective-1000 {
          perspective: 1000px;
          -webkit-perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
          -webkit-transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .mobile-hero-image {
          transform-origin: center center;
          transition: transform 1.4s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.9s ease;
          will-change: transform, opacity;
        }
        @media (max-width: 767px) {
          .mobile-hero-image {
            transform: perspective(1400px) rotateX(16deg) rotateY(-10deg) translateZ(-360px) scale(0.42);
            opacity: 0;
          }
          .mobile-hero-image--visible {
            transform: perspective(1400px) rotateX(0deg) rotateY(0deg) translateZ(0) scale(1);
            opacity: 1;
          }
        }
        @media (min-width: 768px) {
          .mobile-hero-image,
          .mobile-hero-image--visible {
            transform: none;
            opacity: 1;
          }
        }
        .gradient-text {
          background: linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #D97706 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .dot-pattern {
          background-image: radial-gradient(circle, rgba(251, 191, 36, 0.04) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .glow-yellow {
          box-shadow: 0 0 60px rgba(251, 191, 36, 0.08), 0 0 120px rgba(251, 191, 36, 0.04);
        }
        .border-gradient {
          border: 1px solid transparent;
          background-clip: padding-box;
          position: relative;
        }
        .border-gradient::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(251, 191, 36, 0.05), rgba(251, 191, 36, 0.3));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.1); }
          50% { box-shadow: 0 0 40px rgba(251, 191, 36, 0.2); }
        }
        @keyframes scroll-bounce {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(8px); opacity: 0.5; }
        }
        .scroll-indicator {
          animation: scroll-bounce 2s ease-in-out infinite;
        }
      `}</style>

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
                className="h-[42px] w-auto"
              />
            </Link>
          </div>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#solutions" className="text-sm text-gray-400 hover:text-white transition-colors duration-200">
              Solutions
            </Link>
            <Link href="#partners" className="text-sm text-gray-400 hover:text-white transition-colors duration-200">
              Partners
            </Link>
            <Link href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors duration-200">
              How It Works
            </Link>
          </nav>
          <div className="flex items-center">
            <Link href="#waitlist">
              <Button className="bg-yellow-400 text-black hover:bg-yellow-300 font-semibold text-sm px-6 transition-all duration-300 hover:shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                Get Early Access
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
              <div
                className={`flex flex-col md:flex-row items-center md:items-center justify-center transition-all duration-700 ease-in-out ${
                  isCubeComplete ? "gap-8 md:gap-6" : "gap-12 md:gap-24"
                }`}
              >
                <div
                  className={`relative max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl transition-all duration-700 ${
                    isCubeComplete ? "md:mx-auto" : "md:mx-0"
                  }`}
                >
                  <div
                    className={`mobile-hero-image ${
                      mobileHeroPhase === "image" || isCubeComplete ? "mobile-hero-image--visible" : ""
                    }`}
                  >
                    <Image
                      src="/app_landing_page.png"
                      alt="Rumi AI coaching app interface"
                      width={500}
                      height={900}
                      className="rounded-2xl shadow-2xl shadow-yellow-400/5 object-contain max-h-[90vh] w-auto"
                      priority
                    />
                  </div>
                  {/* Mobile-only overlay for rotating words */}
                  {!isCubeComplete && (
                    <div
                      className={`absolute inset-0 z-10 flex items-center justify-center bg-black px-4 md:hidden transition-opacity duration-700 ${
                        mobileHeroPhase === "image" ? "pointer-events-none opacity-0" : "opacity-100"
                      }`}
                    >
                      <RotatingWords onComplete={handleCubeComplete} onMobilePhaseChange={setMobileHeroPhase} />
                    </div>
                  )}
                </div>
                <div
                  className={`hidden md:flex transition-all duration-700 ease-in-out ${
                    isCubeComplete
                      ? "md:w-0 md:opacity-0 md:translate-x-6 md:overflow-hidden"
                      : "md:w-[24rem] md:opacity-100 md:translate-x-0 md:pl-8"
                  }`}
                  aria-hidden={isCubeComplete}
                >
                  {!isCubeComplete && <RotatingWords onComplete={handleCubeComplete} />}
                </div>
              </div>

              {/* Hero subtitle — appears after animation */}
              <div
                className={`mt-8 md:mt-12 text-center max-w-2xl mx-auto transition-all duration-1000 ease-out ${
                  isCubeComplete ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
              >
                <p className="text-gray-400 text-base md:text-lg leading-relaxed mb-4">
                  The world&apos;s first agentic AI coaching platform that delivers real transformation — not just advice.
                  Powered by emotional intelligence and structured programs that adapt to you.
                </p>
                <div className="flex items-center justify-center gap-2 mb-8">
                  <Shield className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm text-gray-500">Your data is private. Never shared with third parties.</span>
                </div>
                <Link href="#waitlist">
                  <Button className="bg-yellow-400 text-black hover:bg-yellow-300 font-semibold text-base px-8 h-12 transition-all duration-300 hover:shadow-[0_0_30px_rgba(251,191,36,0.3)]">
                    Get Early Access
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div
            className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-opacity duration-1000 ${
              isCubeComplete ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="scroll-indicator text-gray-600">
              <ChevronDown className="h-6 w-6" />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 2 — THREE SOLUTIONS
            ══════════════════════════════════════════════════════ */}
        <section id="solutions" className="w-full py-24 md:py-32 lg:py-40 bg-black relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 dot-pattern opacity-50 pointer-events-none" />

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8">
            <RevealSection>
              <div className="text-center mb-16 md:mb-20">
                <span className="inline-block text-yellow-400 text-sm font-semibold tracking-widest uppercase mb-4">
                  Why Rumi Exists
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight mb-6">
                  Real Problems.{" "}
                  <span className="gradient-text">Real Solutions.</span>
                </h2>
                <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                  The personal development industry leaves millions behind.
                  Rumi was built to change that.
                </p>
              </div>
            </RevealSection>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <SolutionCard
                number="01"
                icon={Lock}
                problem="World-class coaching costs $1,000+ and demands days of your time. For most people, personal transformation is priced out of reach."
                solution="Rumi delivers the same depth of transformational coaching starting at $40/month — accessible anytime, anywhere, on your phone."
                delay={0}
              />
              <SolutionCard
                number="02"
                icon={RefreshCw}
                problem="Even powerful breakthroughs fade within days. Without structured daily reinforcement, most personal growth gains disappear — leaving you right back where you started."
                solution="Structured 30-90 day programs with daily micro-coaching, reflective exercises, and adaptive accountability turn fleeting insights into permanent behavioral shifts."
                delay={150}
              />
              <SolutionCard
                number="03"
                icon={Fingerprint}
                problem="Generic self-help treats everyone the same. Cookie-cutter advice doesn't address your unique patterns, blind spots, and emotional state."
                solution="Rumi's agentic AI builds a deep understanding of your character, detects your mood in real-time, and tailors every conversation to exactly where you are right now."
                delay={300}
              />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 3 — PARTNERS
            ══════════════════════════════════════════════════════ */}
        <section id="partners" className="w-full py-24 md:py-32 relative overflow-hidden">
          {/* Subtle gradient divider at top */}
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
            SECTION 4 — INSPIRED BY
            ══════════════════════════════════════════════════════ */}
        <section id="inspired" className="w-full py-24 md:py-32 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent" />
          {/* Radial glow background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.04)_0%,transparent_60%)] pointer-events-none" />

          <div className="relative z-10 w-full max-w-5xl mx-auto px-4 md:px-8">
            <RevealSection>
              <div className="text-center mb-16">
                <span className="inline-block text-yellow-400 text-sm font-semibold tracking-widest uppercase mb-4">
                  Built on the Shoulders of Giants
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                  Inspired by the World&apos;s Most{" "}
                  <span className="gradient-text">Impactful Programs</span>
                </h2>
                <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                  Rumi&apos;s coaching methodology draws from decades of proven transformational frameworks
                  — bringing the power of the world&apos;s best programs to your fingertips through AI.
                </p>
              </div>
            </RevealSection>

            <RevealSection delay={200}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-16 md:gap-24 lg:gap-32">
                <LandmarkLogo />
                <div className="hidden sm:block w-px h-20 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                <TonyRobbinsLogo />
              </div>
            </RevealSection>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 5 — HOW IT WORKS
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
                    <div className="text-yellow-400/30 text-7xl font-black absolute -top-4 right-0 md:right-auto md:-left-2 select-none">
                      1
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-3 relative z-10">
                      Start a Conversation
                    </h3>
                    <p className="text-gray-400 text-base leading-relaxed relative z-10">
                      Tell Rumi what&apos;s on your mind. Our AI coach listens deeply — no judgment, no agenda, no time limits. Available 24/7 whenever you need it.
                    </p>
                  </div>
                  {/* Connector line (desktop only) */}
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
                    <div className="text-yellow-400/30 text-7xl font-black absolute -top-4 right-0 md:right-auto md:-left-2 select-none">
                      2
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-3 relative z-10">
                      Discover Your Patterns
                    </h3>
                    <p className="text-gray-400 text-base leading-relaxed relative z-10">
                      Rumi surfaces the hidden beliefs, emotional reactions, and habitual interpretations that shape your decisions and relationships.
                    </p>
                  </div>
                  <div className="hidden md:block absolute top-8 right-0 w-1/3 h-px bg-gradient-to-r from-yellow-400/20 to-transparent translate-x-full" />
                </div>
              </RevealSection>

              {/* Step 3 */}
              <RevealSection delay={400}>
                <div className="relative text-center md:text-left">
                  <div className="flex flex-col items-center md:items-start">
                    <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mb-6">
                      <Target className="h-7 w-7 text-yellow-400" />
                    </div>
                    <div className="text-yellow-400/30 text-7xl font-black absolute -top-4 right-0 md:right-auto md:-left-2 select-none">
                      3
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-3 relative z-10">
                      Create Lasting Change
                    </h3>
                    <p className="text-gray-400 text-base leading-relaxed relative z-10">
                      Daily micro-coaching sessions, reflective journaling, and accountability check-ins transform insights into permanent behavioral shifts.
                    </p>
                  </div>
                </div>
              </RevealSection>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 6 — STATS / VALUE PROPS
            ══════════════════════════════════════════════════════ */}
        <section className="w-full py-24 md:py-32 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent" />

          <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-8">
            <RevealSection>
              <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden glow-yellow">
                <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-y md:divide-y-0 divide-white/[0.06]">
                  <AnimatedStat
                    icon={Zap}
                    value="$40"
                    suffix="/mo"
                    label="Starting Price"
                    description="A fraction of traditional coaching costs"
                  />
                  <AnimatedStat
                    icon={Clock}
                    value="24/7"
                    label="Always Available"
                    description="Coaching whenever you need it most"
                  />
                  <AnimatedStat
                    icon={TrendingUp}
                    value="30-90"
                    suffix=" Days"
                    label="Structured Programs"
                    description="Designed for lasting behavioral change"
                  />
                  <AnimatedStat
                    icon={Brain}
                    value="Agentic"
                    label="AI-Powered"
                    description="Learns and adapts to your unique patterns"
                  />
                  <AnimatedStat
                    icon={Shield}
                    value="100%"
                    label="Private"
                    description="Your data is never shared with third parties"
                  />
                </div>
              </div>
            </RevealSection>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 7 — FEATURES GRID
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
                  Everything You Need to{" "}
                  <span className="gradient-text">Transform</span>
                </h2>
              </div>
            </RevealSection>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: MessageSquareText,
                  title: "AI-Powered Conversations",
                  desc: "Real-time, natural dialogue with an AI coach that listens, reflects, and responds with emotional intelligence — 24/7.",
                },
                {
                  icon: BookOpen,
                  title: "Proven Coaching Programs",
                  desc: "Structured programs built on proven transformational frameworks, delivered as guided journeys with clear milestones.",
                },
                {
                  icon: UserCog,
                  title: "Hyper Personalization",
                  desc: "Learns your character, goals, and mood over time — adapting every session to your unique patterns and growth edge.",
                },
                {
                  icon: Heart,
                  title: "Emotional Intelligence",
                  desc: "Detects emotional tone and context in real-time, adjusting the coaching approach to meet you where you are.",
                },
                {
                  icon: Target,
                  title: "Accountability System",
                  desc: "Daily check-ins, progress tracking, and reflective prompts that keep you on track between coaching sessions.",
                },
                {
                  icon: Shield,
                  title: "Your Data Stays Yours",
                  desc: "Your conversations are confidential and your data is never shared with third parties. Built on Google Cloud with enterprise-grade security and encryption.",
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
                Ready to Meet the Coach{" "}
                <span className="gradient-text">Who Truly Knows You?</span>
              </h2>
              <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-4">
                Experience coaching that understands who you are, meets you where you are,
                and helps you become who you want to be.
              </p>
              <div className="flex items-center justify-center gap-2 mb-10">
                <Shield className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-gray-500">Your privacy is our priority. Data never shared with third parties.</span>
              </div>
              <Link href="#waitlist">
                <Button className="bg-yellow-400 text-black hover:bg-yellow-300 font-semibold text-lg px-10 h-14 transition-all duration-300 hover:shadow-[0_0_40px_rgba(251,191,36,0.3)]">
                  Get Early Access
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </RevealSection>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 9 — WAITLIST (Final Section)
            ══════════════════════════════════════════════════════ */}
        <section id="waitlist" className="w-full py-24 md:py-32 lg:py-40 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(251,191,36,0.06)_0%,transparent_50%)] pointer-events-none" />

          <div className="relative z-10 w-full px-4 md:px-8">
            <RevealSection>
              <div className="flex flex-col items-center justify-center max-w-lg mx-auto">
                <div className="w-full rounded-3xl border-gradient bg-white/[0.02] backdrop-blur-sm overflow-hidden">
                  <div className="p-8 md:p-10">
                    {!formState?.success && !formState?.alreadyJoined && (
                      <div className="text-center mb-8">
                        <span className="inline-block text-yellow-400 text-sm font-semibold tracking-widest uppercase mb-3">
                          Early Access
                        </span>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                          Start Your Journey with Rumi
                        </h2>
                        <p className="text-gray-400 text-base">
                          Be the first to receive the product link for the beta launch
                        </p>
                      </div>
                    )}

                    {showForm && !formState?.success && !formState?.alreadyJoined ? (
                      <form action={formAction} className="grid gap-5">
                        <div className="space-y-2">
                          <label
                            htmlFor="name"
                            className="text-sm font-medium text-gray-300"
                          >
                            Name
                          </label>
                          <input
                            id="name"
                            name="name"
                            className="flex h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-base text-white placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/50 focus-visible:border-yellow-400/30 transition-all duration-200"
                            placeholder="Your name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="email"
                            className="text-sm font-medium text-gray-300"
                          >
                            Email
                          </label>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            className="flex h-12 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-base text-white placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/50 focus-visible:border-yellow-400/30 transition-all duration-200"
                            placeholder="you@example.com"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="message"
                            className="text-sm font-medium text-gray-300"
                          >
                            Message{" "}
                            <span className="text-gray-600">(optional)</span>
                          </label>
                          <textarea
                            id="message"
                            name="message"
                            rows={3}
                            className="flex w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-base text-white placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/50 focus-visible:border-yellow-400/30 transition-all duration-200 resize-none"
                            placeholder="Tell us what you're hoping to achieve..."
                          />
                        </div>

                        {formState?.error && (
                          <div className="text-red-400 text-sm p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                            {formState.error}
                          </div>
                        )}

                        <div className="pt-2">
                          <SubmitButton />
                        </div>
                      </form>
                    ) : (
                      <div className="text-center py-8">
                        {formState?.success ? (
                          <div className="space-y-4">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 mx-auto">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                className="w-10 h-10 text-green-400"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white">Thank You!</h3>
                            <p className="text-gray-400 text-base">
                              {formState.message ?? "Thanks for joining the waitlist!"}
                            </p>
                          </div>
                        ) : formState?.alreadyJoined ? (
                          <div className="space-y-4">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-500/10 border border-yellow-500/20 mx-auto">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                className="w-10 h-10 text-yellow-400"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                              </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white">Already Joined</h3>
                            <p className="text-gray-400 text-base">{formState.message}</p>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-red-400 text-base">Something went wrong. Please try again.</p>
                            <Button
                              onClick={() => setShowForm(true)}
                              className="mt-4 bg-yellow-400 text-black hover:bg-yellow-300 text-base"
                            >
                              Try Again
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </RevealSection>
          </div>
        </section>
      </main>

      {/* ══════════════════════════════════════════════════════
          FOOTER
          ══════════════════════════════════════════════════════ */}
      <footer className="w-full py-8 bg-black border-t border-white/[0.06]">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <Image src="/rumi_logo.png" alt="Rumi Logo" width={607} height={202} className="h-[36px] w-auto opacity-70" />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Copyright &copy;2026, Rumi, Inc. Los Angeles, California. All rights reserved.
              </p>
            </div>
            <div>
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="inline-flex items-center text-sm text-gray-500 hover:text-yellow-400 transition-colors duration-200"
              >
                <Mail className="h-4 w-4 mr-2" />
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
