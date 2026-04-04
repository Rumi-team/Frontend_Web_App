import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, MessageSquareText, Eye, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "How Rumi Works | AI Voice Coaching",
  description:
    "Talk, See, Stay. Rumi is a private AI voice coach: have a voice conversation, see the patterns holding you back, and get daily follow-ups until the change sticks.",
  alternates: { canonical: "/how-it-works" },
}

const steps = [
  {
    icon: MessageSquareText,
    title: "Talk",
    description:
      "Start a private voice conversation about whatever is on your mind. No scheduling, no judgment, no time limits. Rumi listens the way a great coach listens, asking the questions that surface what you can't see on your own.",
  },
  {
    icon: Eye,
    title: "See",
    description:
      "Rumi surfaces the patterns, beliefs, and reactions shaping your decisions. It measures the depth of your breakthrough in real time, so you can feel the shift happening, not just hope for it.",
  },
  {
    icon: RefreshCw,
    title: "Stay",
    description:
      "This is what makes Rumi different. After your session, you get personalized assignments and daily check-ins. Your transformation score tracks your progress over time. The insight you found on Tuesday is still alive on Friday.",
  },
]

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-black/80 backdrop-blur-xl">
        <nav className="flex items-center justify-between w-full h-16 px-4 md:px-8 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center" aria-label="Rumi home">
            <Image src="/rumi_logo.png" alt="Rumi Logo" width={607} height={202} className="h-[56px] w-auto" />
          </Link>
          <Link href="/login">
            <Button className="bg-yellow-400 text-black hover:bg-yellow-300 font-semibold text-base px-8 h-11">
              Try Rumi Free
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 px-4 md:px-8 py-16 md:py-24 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white leading-[1.1] mb-4">
          How Rumi works
        </h1>
        <p className="text-lg text-gray-400 mb-16">
          Three steps. One conversation at a time.
        </p>

        <div className="space-y-12">
          {steps.map((step, i) => (
            <div key={step.title} className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-yellow-400/10 flex items-center justify-center">
                  <step.icon className="h-6 w-6 text-yellow-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-mono text-yellow-400/60">0{i + 1}</span>
                  <h2 className="text-2xl font-bold text-white">{step.title}</h2>
                </div>
                <p className="text-base md:text-lg text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link href="/login">
            <Button className="bg-yellow-400 text-black hover:bg-yellow-300 font-semibold text-lg px-10 h-14">
              Try Rumi Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-sm text-gray-500 mt-3">
            No credit card. Takes 30 seconds.
          </p>
        </div>
      </main>

      <footer className="w-full py-8 border-t border-white/[0.06] bg-black">
        <div className="max-w-3xl mx-auto px-4 md:px-8 text-center">
          <p className="text-sm text-gray-600">&copy;2026 Rumi, Inc. Made in California.</p>
        </div>
      </footer>
    </div>
  )
}
