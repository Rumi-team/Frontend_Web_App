"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Script from "next/script"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Activity, User, Mail } from "lucide-react"
import { ContactModal } from "@/components/contact-modal"
import { SupabaseClientImage } from "@/components/supabase-client-image"

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
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)

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
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Start your journey with Rumi</CardTitle>
                  <CardDescription className="text-gray-300">
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
              <p className="text-sm text-gray-400">© 2025 Rumi Team LLC. All rights reserved.</p>
            </div>

            {/* Right: Contact */}
            <div className="text-right">
              <h3 className="text-xl font-semibold text-yellow-400 mb-2">Contact Us</h3>
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="flex items-center justify-center md:justify-end text-gray-300 hover:text-yellow-400 transition-colors"
              >
                <Mail className="h-4 w-4 mr-2" />
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
