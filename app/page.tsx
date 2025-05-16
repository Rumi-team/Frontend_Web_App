"use client"

import { useState } from "react"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Activity, User } from "lucide-react"
import { submitWaitlistEntry, type FormState } from "./actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full bg-yellow-400 text-black hover:bg-yellow-300" disabled={pending}>
      {pending ? "Submitting..." : "Join Rumi"}
    </Button>
  )
}

export default function Home() {
  const initialState: FormState = {}
  const [formState, formAction] = useActionState(submitWaitlistEntry, initialState)
  const [showForm, setShowForm] = useState(true)

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <header className="sticky top-0 z-40 w-full border-b border-gray-800 bg-black">
        <div className="container flex items-center justify-between h-16 px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/rumi_logo.png" alt="Rumi Logo" width={120} height={40} priority className="h-10 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="#get-in-touch" scroll={false}>
              <Button className="bg-yellow-400 text-black hover:bg-yellow-300">Start Your Journey</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section id="about" className="w-full min-h-screen flex items-center bg-black text-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="relative mx-auto w-full max-w-sm md:max-w-md lg:max-w-lg">
                <Image
                  src="/feeling_agent.png"
                  alt="Rumi notification detecting user's mood"
                  width={500}
                  height={700}
                  className="rounded-xl shadow-lg object-cover"
                  priority
                />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl flex flex-col">
                  <span>Your</span>
                  <span className="text-yellow-400">Personal</span>
                  <span>Psychologist</span>
                </h2>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-black text-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-yellow-400 px-3 py-1 text-sm text-black">Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">The Rumi AI Approach</h2>
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
                  <CardTitle className="text-2xl">Start Your journey with Rumi</CardTitle>
                  <CardDescription className="text-gray-300">
                    Be the first to receive the product link for the beta launch
                  </CardDescription>
                </CardHeader>
                {showForm && !formState?.success ? (
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
                        {formState?.error && <div className="text-red-500 text-sm mt-2">{formState.error}</div>}
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
                <CardFooter className="text-xs text-gray-500 text-center pt-0 px-8 pb-4">
                  By joining, you agree to our Privacy Policy and Terms of Service.
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full py-6 bg-black text-white border-t border-gray-800">
        <div className="container px-4 md:px-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <Image src="/rumi_logo.png" alt="Rumi Logo" width={120} height={40} className="h-10 w-auto" />
          </div>
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} Rumi Team LLC. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
