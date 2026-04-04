import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Terms of Service | Rumi",
  description:
    "Terms of service for Rumi, the AI voice coaching platform. Read our terms before using the service.",
  alternates: { canonical: "/terms" },
}

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-black/80 backdrop-blur-xl">
        <nav className="flex items-center justify-between w-full h-16 px-4 md:px-8 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center" aria-label="Rumi home">
            <Image src="/rumi_logo.png" alt="Rumi Logo" width={607} height={202} className="h-[56px] w-auto" />
          </Link>
        </nav>
      </header>

      <main className="flex-1 px-4 md:px-8 py-16 md:py-24 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: April 2, 2026</p>

        <div className="space-y-8 text-base text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Agreement to Terms</h2>
            <p>
              By using Rumi, you agree to these terms of service. If you do not agree,
              please do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">What Rumi Is</h2>
            <p>
              Rumi is an AI-powered coaching tool designed for personal development and
              self-reflection. Rumi is <strong className="text-white">not</strong> a
              licensed therapist, counselor, or mental health provider. Rumi does not
              provide medical advice, diagnosis, or treatment.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">What Rumi Is Not</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Not a substitute for professional therapy or counseling</li>
              <li>Not a crisis intervention tool</li>
              <li>Not a medical device</li>
            </ul>
            <p className="mt-3">
              If you are in crisis, please contact the 988 Suicide and Crisis Lifeline
              (call or text 988), text HOME to 741741 (Crisis Text Line), or call your
              local emergency services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Your Account</h2>
            <p>
              You are responsible for maintaining the security of your account. You must
              be at least 18 years old to use Rumi.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Beta Service</h2>
            <p>
              Rumi is currently in beta. The service is provided &ldquo;as is&rdquo; and
              may change, be interrupted, or be discontinued at any time. During beta,
              the service is free.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Contact</h2>
            <p>
              Questions? Email us at{" "}
              <a href="mailto:support@rumi.team" className="text-yellow-400 hover:underline">
                support@rumi.team
              </a>
              .
            </p>
          </section>
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
