"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Activity, User, Mail } from "lucide-react"
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
}

function RotatingWords({ onComplete }: RotatingWordsProps) {
  const [currentFace, setCurrentFace] = useState(0)
  const [animationComplete, setAnimationComplete] = useState(false)
  const topLine = "Your"
  const bottomLine = "Coach"
  const rotatingWords = ["Personal", "AI-powered", "Unbiased"]

  useEffect(() => {
    if (animationComplete) return

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
  }, [animationComplete])

  useEffect(() => {
    if (!animationComplete || !onComplete) {
      return
    }

    const timer = setTimeout(() => {
      onComplete()
    }, 1500)

    return () => clearTimeout(timer)
  }, [animationComplete, onComplete])

  return (
    <>
      <style jsx>{`
        .word-anim {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          animation: growWord 0.9s ease forwards;
          will-change: transform, opacity;
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
      `}</style>
      <div className="flex flex-col items-center text-yellow-400 font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl space-y-6 leading-tight text-center">
        <span className="text-white">{topLine}</span>
        <div className="relative h-20 w-full flex items-center justify-center text-yellow-400">
          <span
            key={`${currentFace}-${rotatingWords[currentFace]}`}
            className="word-anim px-4 whitespace-nowrap"
          >
            {rotatingWords[currentFace]}
          </span>
        </div>
        <span className="text-white">{bottomLine}</span>
      </div>
    </>
  )
}

export default function Home() {
  const initialState: FormState = {}
  const [formState, formAction] = useActionState(submitWaitlistEntry, initialState)
  const [showForm, setShowForm] = useState(true)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [isCubeComplete, setIsCubeComplete] = useState(false)
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
            paddingTop:    "env(safe-area-inset-top)",
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
                className={`flex flex-col md:flex-row items-center md:items-center justify-center transition-all duration-700 ease-in-out ${
                  isCubeComplete ? "gap-8 md:gap-6" : "gap-10 md:gap-16"
                }`}
              >
                <div
                  className={`relative max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl transition-all duration-700 ${
                    isCubeComplete ? "md:mx-auto" : "md:mx-0"
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
                  {/* Mobile‑only overlay for rotating words */}
                  {/* Mobile-only overlay: centered & scaled-down */}
                  {!isCubeComplete && (
                    <div className="absolute inset-0 flex items-center justify-center md:hidden z-10">
                      <div className="transform scale-75">
                        <RotatingWords onComplete={handleCubeComplete} />
                      </div>
                    </div>
                  )}
                </div>
                <div
                  className={`hidden md:flex transition-all duration-700 ease-in-out ${
                    isCubeComplete
                      ? "md:w-0 md:opacity-0 md:translate-x-6 md:overflow-hidden"
                      : "md:w-[24rem] md:opacity-100 md:translate-x-0 md:pl-12"
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
                  Our AI-powered platform adapts to your unique needs, providing personalized guidance for your
                  self-improvement journey.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 mt-12">
              <Card className="border-2 border-yellow-400 bg-gray-900 text-white">
                <CardHeader>
                  <BarChart3 className="h-12 w-12 text-yellow-400" />
                  <CardTitle className="mt-4 text-xl md:text-2xl">Adaptive Recommendations</CardTitle>
                  <CardDescription className="text-gray-300 text-base md:text-lg">
                    Our AI continuously learns from your progress and adjusts recommendations to optimize your personal
                    growth journey.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-2 border-yellow-400 bg-gray-900 text-white">
                <CardHeader>
                  <Activity className="h-12 w-12 text-yellow-400" />
                  <CardTitle className="mt-4 text-xl md:text-2xl">Real-Time Mood Integration</CardTitle>
                  <CardDescription className="text-gray-300 text-base md:text-lg">
                    Rumi adapts to your emotional state, providing support and guidance tailored to how you're feeling
                    in the moment.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-2 border-yellow-400 bg-gray-900 text-white">
                <CardHeader>
                  <User className="h-12 w-12 text-yellow-400" />
                  <CardTitle className="mt-4 text-xl md:text-2xl">Personality-Driven Experiences</CardTitle>
                  <CardDescription className="text-gray-300 text-base md:text-lg">
                    Experience a self-improvement journey uniquely tailored to your personality traits, preferences, and
                    learning style.
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
                Copyright ©2025, Rumi, Inc.
                <br />
                All rights reserved.
              </p>
            </div>

            {/* Right: Contact */}
            <div className="w-full text-center md:w-auto md:text-right">
              <h3 className="text-xl font-semibold text-yellow-400 mb-2">Contact Us</h3>
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="inline-flex items-center justify-center md:justify-end text-gray-300 hover:text-yellow-400 transition-colors text-base"
              >
                <Mail className="h-5 w-5 mr-2" />
                support@rumi.team
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
