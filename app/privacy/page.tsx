import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Privacy Policy | Rumi",
  description:
    "Your conversations with Rumi are completely private. Read our privacy policy to understand how we protect your data.",
  alternates: { canonical: "/privacy" },
}

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: April 2, 2026</p>

        <div className="space-y-8 text-base text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Your Privacy Matters</h2>
            <p>
              Rumi is built on a simple promise: what you say stays between you and Rumi.
              Your coaching sessions are confidential. We do not sell, share, or monetize
              your personal data or session content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">What We Collect</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Account information (email, name) for authentication</li>
              <li>Session transcripts and coaching data to provide personalized follow-ups</li>
              <li>Usage data (session frequency, feature usage) to improve the product</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">What We Don&apos;t Do</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>We do not sell your data to third parties</li>
              <li>We do not use your session content for advertising</li>
              <li>We do not share identifiable data with other users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Data Security</h2>
            <p>
              Your data is encrypted in transit and at rest. We use enterprise-grade
              infrastructure on Google Cloud Platform with industry-standard security
              practices.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Data Deletion</h2>
            <p>
              You can request deletion of your account and all associated data at any time
              by contacting us at{" "}
              <a href="mailto:support@rumi.team" className="text-yellow-400 hover:underline">
                support@rumi.team
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Contact</h2>
            <p>
              Questions about this policy? Email us at{" "}
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
