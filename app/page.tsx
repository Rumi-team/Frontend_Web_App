"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import Script from "next/script"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Activity, User, Mail } from "lucide-react"
import { ContactModal } from "@/components/contact-modal"

function RotatingCube() {
  const [currentFace, setCurrentFace] = useState(0)
  const [animationComplete, setAnimationComplete] = useState(false)
  const faces = ["Your", "Personal", "Life Coach", "Your", "Personal", "Life Coach"]
  // const faces = [
  //   "Psychologist",
  //   "pyschologist",
  //   "Friend",
  //   "Psychologist",
  //   "pyschologist",
  //   "Friend",
  //   "Psychologist"
  // ]

  useEffect(() => {
    if (animationComplete) return

    const interval = setInterval(() => {
      setCurrentFace((prev) => {
        const nextFace = (prev + 1) % faces.length

        if (nextFace === faces.length - 1) {
          setAnimationComplete(true)
          clearInterval(interval)
        }

        return nextFace
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [animationComplete])

  return (
    <div className="relative w-48 h-48 perspective-1000">
      <div
        className="relative w-full h-full transform-style-3d transition-transform duration-1000 ease-in-out"
        style={{ transform: `rotateX(${currentFace * -90}deg)` }}
      >
        {faces.map((face, index) =>
          index === currentFace && (
            <div
              key={index}
              className="absolute w-full h-full flex items-center justify-center text-yellow-400 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold backface-hidden"
              style={{
                transform: `rotateX(${index * 90}deg) translateZ(6rem)`,
              }}
            >
              {face}
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default function Home() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
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
        <section id="about" className="w-full min-h-screen flex items-center justify-center bg-black text-white">
          <div className="w-full px-4 md:px-6">
            <div className="flex flex-col items-center justify-center">
              <div className="flex flex-col md:flex-row items-center justify-center gap-16">
                <div className="relative max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl">
                  <Image
                    src="/feeling_agent.png"
                    alt="Rumi notification detecting user's mood"
                    width={500}
                    height={900}
                    className="rounded-xl shadow-lg object-contain max-h-[90vh] w-auto"
                    priority
                  />
                  {/* Mobile‑only overlay for rotating words */}
                  {/* Mobile-only overlay: centered & scaled-down */}
                  <div className="absolute inset-0 flex items-center justify-center md:hidden z-10">
                    <div className="transform scale-75">
                      <RotatingCube />
                    </div>
                  </div>
                </div>
                <div className="hidden md:block w-60">
                  <RotatingCube />
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
                <div className="text-3xl font-bold tracking-tighter sm:text-5xl">The Rumi Approach</div>
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
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl md:text-3xl">Start your journey with Rumi</CardTitle>
                  <CardDescription className="text-gray-300 text-base md:text-lg">
                    Be the first to receive the product link for the beta launch
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Script src="https://js-na2.hsforms.net/forms/embed/243471579.js" defer />
                  <div
                    className="hs-form-frame"
                    data-region="na2"
                    data-form-id="435b79ca-013f-4a23-bf5a-8a59224cab64"
                    data-portal-id="243471579"
                  ></div>
                </CardContent>
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
              <p className="text-base text-gray-400"> Copyright ©2025, Rumi, Inc. - All rights reserved.</p>
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
