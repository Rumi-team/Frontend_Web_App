"use client"

import { useState, useEffect, useRef } from "react"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Activity, User, Mail } from "lucide-react"
import { submitWaitlistEntry, type FormState } from "./actions"
import { ContactModal } from "@/components/contact-modal"
import { SupabaseClientImage } from "@/components/supabase-client-image"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full bg-yellow-400 text-black hover:bg-yellow-300" disabled={pending}>
      {pending ? "Submitting..." : "Join Rumi"}
    </Button>
  )
}

function RotatingCube() {
  const [currentFace, setCurrentFace] = useState(0)
  const [animationComplete, setAnimationComplete] = useState(false)
  const faces = ["Partner", "Psychologist", "Companion", "Partner"]
  const rotationCount = useRef(0)

  useEffect(() => {
    if (animationComplete) return

    const interval = setInterval(() => {
      setCurrentFace((prev) => {
        const nextFace = (prev + 1) % faces.length

        // If we've reached the last face (Partner again)
        if (nextFace === 3) {
          rotationCount.current += 1

          // If we've completed one full rotation
          if (rotationCount.current >= 1) {
            setAnimationComplete(true)
            clearInterval(interval)
          }
        }

        return nextFace
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [animationComplete])

  return (
    <div className="cube-container h-16 relative perspective-1000">
      <div
        className="cube w-full h-full relative transform-style-3d transition-transform duration-1000 ease-in-out"
        style={{ transform: `rotateX(${currentFace * -90}deg)` }}
      >
        {faces.map((face, index) => (
          <div
            key={index}
            className={`cube-face absolute w-full h-full flex items-center justify-center text-yellow-400 text-3xl md:text-4xl lg:text-5xl font-bold backface-hidden`}
            style={{ transform: `rotateX(${index * 90}deg) translateZ(2rem)` }}
          >
            {face}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DirectImagePage() {
  const initialState: FormState = {}
  const [formState, formAction] = useActionState(submitWaitlistEntry, initialState)
  const [showForm, setShowForm] = useState(true)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)

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
    <div className="flex flex-col min-h-screen bg-black text-white">
      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
      `}</style>
      <header className="sticky top-0 z-40 w-full border-b border-gray-800 bg-black">
        <div className="container flex items-center justify-between h-16 px-4 md:px-6">
          <div className="flex items-center">
            <div className="flex items-center relative">
              <Link href="/" className="flex items-center">
                <SupabaseClientImage
                  bucket="images"
                  path="rumi_logo.png"
                  alt="Rumi Logo"
                  width={150}
                  height={50}
                  priority
                  className="h-12 w-auto"
                />
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="#get-in-touch" scroll={false}>
              <Button className="bg-yellow-400 text-black hover:bg-yellow-300">Start your journey</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section id="about" className="w-full min-h-screen flex items-center justify-center bg-black text-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center">
              <div className="md:hidden mb-6 text-center">
                <div className="text-yellow-400 text-4xl font-bold">Partner</div>
              </div>
              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                <div className="relative max-w-sm md:max-w-md lg:max-w-lg">
                  <SupabaseClientImage
                    bucket="images"
                    path="feeling_agent.png"
                    alt="Rumi notification detecting user's mood"
                    width={500}
                    height={900}
                    className="rounded-xl shadow-lg object-contain"
                    priority
                  />
                </div>
                <div className="hidden md:block w-40">
                  <RotatingCube />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-black text-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-yellow-400 px-3 py-1 text-sm text-black">Features</div>
                <div className="text-3xl font-bold tracking-tighter sm:text-5xl">The Rumi AI Approach</div>
                <p className="max-w-[900px] text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our AI-powered platform adapts to your unique needs, providing personalized guidance for your
                  self-improvement journey.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 mt-12">
              <Card className="border-2 border-yellow-400 bg-gray-900 text-white">
                <CardHeader>
                  <BarChart3 className="h-10 w-10 text-yellow-400" />
                  <CardTitle className="mt-4">Adaptive Recommendations</CardTitle>
                  <CardDescription className="text-gray-300">
                    Our AI continuously learns from your progress and adjusts recommendations to optimize your personal
                    growth journey.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-2 border-yellow-400 bg-gray-900 text-white">
                <CardHeader>
                  <Activity className="h-10 w-10 text-yellow-400" />
                  <CardTitle className="mt-4">Real-Time Mood Integration</CardTitle>
                  <CardDescription className="text-gray-300">
                    Rumi adapts to your emotional state, providing support and guidance tailored to how you're feeling
                    in the moment.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-2 border-yellow-400 bg-gray-900 text-white">
                <CardHeader>
                  <User className="h-10 w-10 text-yellow-400" />
                  <CardTitle className="mt-4">Personality-Driven Experiences</CardTitle>
                  <CardDescription className="text-gray-300">
                    Experience a self-improvement journey uniquely tailored to your personality traits, preferences, and
                    learning style.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        <section id="get-in-touch" className="w-full py-12 md:py-24 lg:py-32 bg-black text-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center">
              <Card className="bg-gray-900 text-white border-yellow-400 w-full max-w-md mx-auto">
                {!formState?.success && !formState?.alreadyJoined && (
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Start your journey with Rumi</CardTitle>
                    <CardDescription className="text-gray-300">
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
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Name
                          </label>
                          <input
                            id="name"
                            name="name"
                            className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="John Doe"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="email"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Email
                          </label>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            className="flex h-10 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="john.doe@example.com"
                            required
                          />
                        </div>
                        {formState?.error && (
                          <div className="text-red-500 text-sm mt-2 p-2 bg-red-950 bg-opacity-30 rounded border border-red-800">
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
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-500 mx-auto">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className="w-8 h-8"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-medium text-white">Thank You!</h3>
                        <p className="text-gray-300">{formState.message}</p>
                      </div>
                    ) : formState?.alreadyJoined ? (
                      <div className="space-y-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 text-yellow-500 mx-auto">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className="w-8 h-8"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-xl font-medium text-white">Already Joined</h3>
                        <p className="text-gray-300">{formState.message}</p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-red-500">Something went wrong. Please try again.</p>
                        <Button
                          onClick={() => setShowForm(true)}
                          className="mt-4 bg-yellow-400 text-black hover:bg-yellow-300"
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
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Left: Logo */}
            <div className="mb-4 md:mb-0">
              <SupabaseClientImage
                bucket="images"
                path="rumi_logo.png"
                alt="Rumi Logo"
                width={150}
                height={50}
                className="h-12 w-auto"
              />
            </div>

            {/* Center: Copyright */}
            <div className="mb-4 md:mb-0 text-center">
              <p className="text-sm text-gray-400">© 2025 Rumi Team LLC.</p>
            </div>

            {/* Right: Contact */}
            <div className="text-right">
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="flex items-center justify-center md:justify-end text-gray-300 hover:text-yellow-400 transition-colors text-xl font-medium"
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
