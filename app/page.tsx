"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquareText, BookOpen, UserCog, Mail } from "lucide-react"
import { submitWaitlistEntry, type FormState } from "./actions"
import { ContactModal } from "@/components/contact-modal"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full bg-yellow-400 text-black hover:bg-yellow-300" disabled={pending}>
      {pending ? "Submitting..." : "Join Rumi"}
    </Button>
  )
}

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

  // Reset form when success state changes
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
        /* clear the iOS notch */
        paddingTop: "env(safe-area-inset-top)",
        /* lift above the bottom toolbar */
        paddingBottom: "env(safe-area-inset-bottom)"
      }}
    >
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
      `}</style>
      <header className="sticky top-0 z-40 w-full border-b border-gray-800 bg-black">
        <div className="flex items-center justify-between w-full h-16 px-4 md:px-6">
          <div className="flex items-center">
            <div className="flex items-center relative">
              <Link href="/" className="flex items-center">
                <Image
                  src="/rumi_logo.png"
                  alt="Rumi Logo"
                  width={607}
                  height={202}
                  priority
                  className="h-[48.6px] w-auto"
                />
              </Link>
            </div>
          </div>
          <div className="flex items-center ml-auto">
            <Link href="#get-in-touch">
              <Button className="bg-yellow-400 text-black hover:bg-yellow-300">Start your journey</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section
          id="about"
          className="w-full min-h-screen flex items-center justify-center pt-6 md:pt-12 bg-black text-white"
        >
          <div className="w-full px-4 md:px-6">
            <div className="flex flex-col items-center justify-center">
              <div
                className={`flex flex-col md:flex-row items-center md:items-center justify-center transition-all duration-700 ease-in-out ${isCubeComplete ? "gap-8 md:gap-6" : "gap-12 md:gap-24"
                  }`}
              >
                <div
                  className={`relative max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl transition-all duration-700 ${isCubeComplete ? "md:mx-auto" : "md:mx-0"
                    }`}
                >
                  <div
                    className={`mobile-hero-image ${mobileHeroPhase === "image" || isCubeComplete ? "mobile-hero-image--visible" : ""
                      }`}
                  >
                    <Image
                      src="/app_landing_page.png"
                      alt="Rumi notification detecting user's mood"
                      width={500}
                      height={900}
                      className="rounded-xl shadow-lg object-contain max-h-[90vh] w-auto"
                      priority
                    />
                  </div>
                  {/* Mobile‑only overlay for rotating words */}
                  {/* Mobile-only overlay: centered & scaled-down */}
                  {!isCubeComplete && (
                    <div
                      className={`absolute inset-0 z-10 flex items-center justify-center bg-black px-4 md:hidden transition-opacity duration-700 ${mobileHeroPhase === "image" ? "pointer-events-none opacity-0" : "opacity-100"
                        }`}
                    >
                      <RotatingWords onComplete={handleCubeComplete} onMobilePhaseChange={setMobileHeroPhase} />
                    </div>
                  )}
                </div>
                <div
                  className={`hidden md:flex transition-all duration-700 ease-in-out ${isCubeComplete
                    ? "md:w-0 md:opacity-0 md:translate-x-6 md:overflow-hidden"
                    : "md:w-[24rem] md:opacity-100 md:translate-x-0 md:pl-8"
                    }`}
                  aria-hidden={isCubeComplete}
                >
                  {!isCubeComplete && <RotatingWords onComplete={handleCubeComplete} />}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-black text-white">
          <div className="w-full px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-yellow-400 px-3 py-1 text-sm text-black">Features</div>
                <div className="text-3xl font-bold tracking-tighter sm:text-5xl">Rumi  Coaching Platform</div>
                <p className="max-w-[900px] text-gray-300 md:text-xl/relaxed lg:text-xl/relaxed xl:text-2xl/relaxed">
                  AI-powered conversational coaching built on proven programs, tailored to your character and mood.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 mt-12">
              <Card className="border-2 border-yellow-400 bg-gray-900 text-white min-h-[22rem]">
                <CardHeader className="h-full flex flex-col justify-center">
                  <MessageSquareText className="h-12 w-12 text-yellow-400" />
                  <CardTitle className="mt-4 text-xl md:text-2xl">AI-powered Conversations</CardTitle>
                  <CardDescription className="text-gray-300 text-base md:text-lg">
                    Real-time, natural dialogue with an AI coach that listens, reflects, and responds like a human, without judgement 24/7.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-2 border-yellow-400 bg-gray-900 text-white min-h-[22rem]">
                <CardHeader className="h-full flex flex-col justify-center">
                  <BookOpen className="h-12 w-12 text-yellow-400" />
                  <CardTitle className="mt-4 text-xl md:text-2xl">Proven Coaching Programs</CardTitle>
                  <CardDescription className="text-gray-300 text-base md:text-lg">
                    Inspired by proven coaching programs and evidence-backed frameworks, structured into clear, practical step, guided by AI coach.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-2 border-yellow-400 bg-gray-900 text-white min-h-[22rem]">
                <CardHeader className="h-full flex flex-col justify-center">
                  <UserCog className="h-12 w-12 text-yellow-400" />
                  <CardTitle className="mt-4 text-xl md:text-2xl">Hyper Personalization</CardTitle>
                  <CardDescription className="text-gray-300 text-base md:text-lg">
                    Learns your character, goals, and mood, adapting and growing with you to keep you on track.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        <section id="get-in-touch" className="w-full py-12 md:py-24 lg:py-32 bg-black text-white">
          <div className="w-full px-4 md:px-6">
            <div className="flex flex-col items-center justify-center">
              <Card className="bg-gray-900 text-white border-yellow-400 w-full max-w-md mx-auto">
                {!formState?.success && !formState?.alreadyJoined && (
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl md:text-3xl">Start your journey with Rumi</CardTitle>
                    <CardDescription className="text-gray-300 text-base md:text-lg">
                      Be the first to receive the product link for the beta launch
                    </CardDescription>
                  </CardHeader>
                )}
                {showForm && !formState?.success && !formState?.alreadyJoined ? (
                  <>
                    <CardContent>
                      <form action={formAction} className="grid gap-4">
                        <div className="space-y-2">
                          <label
                            htmlFor="name"
                            className="text-base md:text-lg font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Name
                          </label>
                          <input
                            id="name"
                            name="name"
                            className="flex h-12 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-base md:text-lg text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="John Doe"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="email"
                            className="text-base md:text-lg font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Email
                          </label>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            className="flex h-12 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-base md:text-lg text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="john.doe@example.com"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="message"
                            className="text-base md:text-lg font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Message (Optional)
                          </label>
                          <textarea
                            id="message"
                            name="message"
                            rows={4}
                            className="flex w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-base md:text-lg text-white ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                            placeholder="Tell us about yourself or what you're hoping to achieve..."
                          />
                        </div>
                        {formState?.error && (
                          <div className="text-red-500 text-base md:text-lg mt-2 p-2 bg-red-950 bg-opacity-30 rounded border border-red-800">
                            {formState.error}
                          </div>
                        )}
                        <CardFooter className="px-0 pt-4">
                          <SubmitButton />
                        </CardFooter>
                      </form>
                    </CardContent>
                  </>
                ) : (
                  <CardContent className="text-center py-8">
                    {formState?.success ? (
                      <div className="space-y-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-500 mx-auto">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className="w-10 h-10"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-medium text-white">Thank You!</h3>
                        <p className="text-gray-300 text-lg">
                          {formState.message ?? "Thanks for joining the wait‑list!"}
                        </p>
                        {/* <p className="text-gray-400 text-base">
                          📧 Check your inbox (and spam folder) for a link to our short survey.
                        </p> */}
                      </div>
                    ) : formState?.alreadyJoined ? (
                      <div className="space-y-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 text-yellow-500 mx-auto">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className="w-10 h-10"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-medium text-white">Already Joined</h3>
                        <p className="text-gray-300 text-lg">{formState.message}</p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-red-500 text-lg">Something went wrong. Please try again.</p>
                        <Button
                          onClick={() => setShowForm(true)}
                          className="mt-4 bg-yellow-400 text-black hover:bg-yellow-300 text-base"
                        >
                          Try Again
                        </Button>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full py-6 bg-black text-white border-t border-gray-800">
        <div className="w-full px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Left: Logo */}
            <div className="mb-4 md:mb-0">
              <Image src="/rumi_logo.png" alt="Rumi Logo" width={607} height={202} className="h-[48.6px] w-auto" />
            </div>

            {/* Center: Copyright */}
            <div className="mb-4 md:mb-0 text-center">
              <p className="text-base text-gray-400">
                Copyright ©2026, Rumi, Inc. Los Angeles, California
                <br />
                All rights reserved.
              </p>
            </div>

            {/* Right: Contact */}
            <div className="w-full text-center md:w-auto md:text-right">
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="inline-flex items-center justify-center md:justify-end text-gray-300 hover:text-yellow-400 transition-colors text-xl font-medium"
              >
                <Mail className="h-6 w-6 mr-2" />
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
