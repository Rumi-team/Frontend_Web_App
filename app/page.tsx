import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Lock, MessageSquareText, Eye, RefreshCw } from "lucide-react"
import { AuthRedirect } from "@/components/landing/auth-redirect"
import { FAQ } from "@/components/landing/faq"
import { faqs } from "@/lib/faq-data"
import { Footer } from "@/components/landing/footer"

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
}

export default function Home() {
  return (
    <div
      className="flex flex-col min-h-screen bg-black text-white"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* FAQ structured data for Google rich snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Auth redirect (client component — handles session check + PKCE) */}
      <AuthRedirect />

      {/* ── NAV ── */}
      <header
        className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-black/80 backdrop-blur-xl"
        role="banner"
      >
        <nav
          className="flex items-center justify-between w-full h-16 px-4 md:px-8 max-w-7xl mx-auto"
          aria-label="Main navigation"
        >
          <Link href="/" className="flex items-center" aria-label="Rumi home">
            <Image
              src="/rumi_logo.png"
              alt="Rumi Logo"
              width={607}
              height={202}
              priority
              className="h-[56px] w-auto"
            />
          </Link>
          <Link href="/login" className="inline-flex items-center">
            <Button className="bg-yellow-400 text-black hover:bg-yellow-300 font-semibold text-base px-8 h-11 transition-all duration-300 hover:shadow-[0_0_20px_rgba(251,191,36,0.3)]">
              Try Rumi Free
            </Button>
          </Link>
        </nav>
      </header>

      <main>
        {/* ── HERO ── */}
        <section className="relative px-4 md:px-8 pt-16 md:pt-24 pb-12 md:pb-20 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
            {/* Hero text */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-5xl md:text-6xl font-bold text-white leading-[1.1] mb-6">
                Have the conversation{" "}
                <span className="text-yellow-400">
                  you&apos;ve been avoiding.
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-xl leading-relaxed">
                Say what you&apos;ve never said out loud. A private voice
                conversation with an AI that actually listens, then follows up
                until it sticks.
              </p>
              <Link href="/login" className="inline-flex items-center">
                <Button className="bg-yellow-400 text-black hover:bg-yellow-300 font-semibold text-lg px-10 h-14 transition-all duration-300 hover:shadow-[0_0_40px_rgba(251,191,36,0.3)]">
                  Try Rumi Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <p className="text-sm text-gray-500 mt-3">
                No credit card. Takes 30 seconds.
              </p>
            </div>

            {/* Phone mockup — hidden on mobile so CTA stays above fold */}
            <div className="hidden md:flex flex-shrink-0 items-center justify-center">
              <div className="relative w-[240px] h-[480px] rounded-[2.5rem] border-2 border-white/10 bg-gray-950 overflow-hidden shadow-2xl shadow-yellow-400/5">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 shadow-[0_0_60px_rgba(251,191,36,0.3)] mb-6" />
                  <span className="text-sm text-gray-500">
                    Tap to start your session
                  </span>
                </div>
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl" />
              </div>
            </div>
          </div>
        </section>

        {/* ── PROBLEM: The 95% stat ── */}
        <section className="py-20 md:py-28 px-4 md:px-8 border-t border-white/[0.06] bg-gray-950/50">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-[6rem] md:text-[10rem] font-black leading-none bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
              95%
            </p>
            <p className="text-xl md:text-2xl text-gray-300 font-semibold mt-2 mb-6">
              of breakthroughs don&apos;t last.
            </p>
            <p className="text-base md:text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
              You&apos;ve read the books. You&apos;ve had the insights. Nothing
              sticks. Research shows most people who experience a personal
              breakthrough fade back to baseline within weeks. Rumi is built to
              fix that.
            </p>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="py-20 px-4 md:px-8 max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
            How Rumi works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Talk */}
            <div className="flex flex-col items-center text-center p-8 rounded-2xl border border-white/[0.06] bg-gray-950/50">
              <div className="w-12 h-12 rounded-full bg-yellow-400/10 flex items-center justify-center mb-5">
                <MessageSquareText className="h-6 w-6 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Talk</h3>
              <p className="text-gray-400 text-base leading-relaxed">
                A private voice conversation with your AI coach. No scheduling,
                no judgment, no time limits. Available 24/7.
              </p>
            </div>

            {/* See */}
            <div className="flex flex-col items-center text-center p-8 rounded-2xl border border-white/[0.06] bg-gray-950/50">
              <div className="w-12 h-12 rounded-full bg-yellow-400/10 flex items-center justify-center mb-5">
                <Eye className="h-6 w-6 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">See</h3>
              <p className="text-gray-400 text-base leading-relaxed">
                Rumi surfaces the patterns, beliefs, and reactions shaping your
                life, then measures the depth of your breakthrough in real time.
              </p>
            </div>

            {/* Stay — visually dominant */}
            <div className="flex flex-col items-center text-center p-8 md:p-10 rounded-2xl border-2 border-yellow-400/30 bg-gray-950/80 shadow-[0_0_30px_rgba(251,191,36,0.08)] md:scale-105">
              <div className="w-14 h-14 rounded-full bg-yellow-400/20 flex items-center justify-center mb-5">
                <RefreshCw className="h-7 w-7 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-yellow-400 mb-3">
                Stay
              </h3>
              <p className="text-gray-400 text-base leading-relaxed">
                Personalized assignments, daily check-ins, and transformation
                scoring ensure your insights become permanent change, not another
                forgotten moment.
              </p>
            </div>
          </div>

          {/* Mid-page CTA */}
          <div className="flex justify-center mt-14">
            <Link href="/login" className="inline-flex items-center">
              <Button className="bg-yellow-400 text-black hover:bg-yellow-300 font-semibold text-lg px-10 h-14 transition-all duration-300 hover:shadow-[0_0_40px_rgba(251,191,36,0.3)]">
                Try Rumi Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* ── SOCIAL PROOF ── */}
        <section className="py-20 px-4 md:px-8 border-t border-white/[0.06] bg-gray-950/50">
          <div className="max-w-2xl mx-auto text-center">
            {/* Founder note (origin story) */}
            <div className="text-left max-w-lg mx-auto">
              <p className="text-lg italic text-gray-300 leading-relaxed">
                &ldquo;I spent thousands on transformational coaching programs.
                They worked, for about three weeks. Then everything faded. I
                built Rumi because the insight was never the problem. Keeping it
                was.&rdquo;
              </p>
              <p className="text-sm text-gray-500 mt-4">
                &mdash; Parnian, Founder
              </p>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <FAQ />

        {/* ── FINAL CTA ── */}
        <section className="py-20 px-4 md:px-8 text-center border-t border-white/[0.06]">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Your transformation starts with one conversation.
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Free during beta. Private. Available 24/7.
          </p>
          <Link href="/login" className="inline-flex items-center">
            <Button className="bg-yellow-400 text-black hover:bg-yellow-300 font-semibold text-lg px-10 h-14 transition-all duration-300 hover:shadow-[0_0_40px_rgba(251,191,36,0.3)]">
              Try Rumi Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center justify-center gap-2 mt-6">
            <Lock className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-gray-500">
              No credit card. Your data is never shared.
            </span>
          </div>
        </section>
      </main>

      {/* ── FOOTER (client component — contact modal state) ── */}
      <Footer />
    </div>
  )
}
