import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "About Rumi | AI Voice Coaching That Sticks",
  description:
    "Rumi was built because the insight was never the problem. Keeping it was. Meet the team behind the AI voice coach that follows up until the change sticks.",
  alternates: { canonical: "/about" },
}

export default function AboutPage() {
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
        <h1 className="text-4xl md:text-5xl font-bold text-white leading-[1.1] mb-8">
          Why Rumi exists
        </h1>

        <div className="space-y-6 text-base md:text-lg text-gray-400 leading-relaxed">
          <p>
            Rumi was born from a simple observation: coaching works, but it doesn&apos;t last.
          </p>
          <p>
            Our founder, Parnian, spent thousands on transformational coaching programs.
            They worked. For about three weeks. Then the insights faded, the motivation
            dried up, and she was back to baseline. The pattern repeated with every
            program, every workshop, every book.
          </p>
          <p>
            The problem was never the insight. It was the follow-through. Research shows
            that 95% of people who experience a personal breakthrough fade back to their
            previous patterns within weeks. Not because the insight was wrong, but because
            nobody followed up.
          </p>
          <p>
            Rumi is built to fix that. It&apos;s a private AI voice coach that listens,
            surfaces the patterns holding you back, and then does what no other tool does:
            follows up. Daily check-ins, personalized assignments, and real-time
            breakthrough scoring ensure that the clarity you find today doesn&apos;t
            disappear by Thursday.
          </p>
          <p className="text-white font-semibold">
            Available 24/7. Completely private. Free during beta.
          </p>
        </div>

        <div className="mt-12">
          <Link href="/login">
            <Button className="bg-yellow-400 text-black hover:bg-yellow-300 font-semibold text-lg px-10 h-14">
              Try Rumi Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
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
