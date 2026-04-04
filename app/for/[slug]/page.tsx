import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { ArrowRight, Lock, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCases } from "./use-cases"

export const dynamicParams = false

export function generateStaticParams() {
  return useCases.map((uc) => ({ slug: uc.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const uc = useCases.find((u) => u.slug === slug)
  if (!uc) return {}

  return {
    title: uc.metaTitle,
    description: uc.metaDescription,
    alternates: {
      canonical: `/for/${uc.slug}`,
    },
    openGraph: {
      title: uc.metaTitle,
      description: uc.metaDescription,
      url: `https://rumiagent.com/for/${uc.slug}`,
      siteName: "Rumi",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: uc.metaTitle,
      description: uc.metaDescription,
    },
  }
}

export default async function UseCasePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const uc = useCases.find((u) => u.slug === slug)
  if (!uc) notFound()

  const related = useCases.filter((u) => uc.relatedSlugs.includes(u.slug))

  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: uc.metaTitle,
    description: uc.metaDescription,
    url: `https://rumiagent.com/for/${uc.slug}`,
    about: {
      "@type": "SoftwareApplication",
      name: "Rumi",
      applicationCategory: "LifestyleApplication",
      url: "https://rumiagent.com",
    },
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />

      {/* Nav */}
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-black/80 backdrop-blur-xl">
        <nav className="flex items-center justify-between w-full h-16 px-4 md:px-8 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center" aria-label="Rumi home">
            <Image
              src="/rumi_logo.png"
              alt="Rumi Logo"
              width={607}
              height={202}
              className="h-[56px] w-auto"
            />
          </Link>
          <Link href="/login" className="inline-flex items-center">
            <Button className="bg-yellow-400 text-black hover:bg-yellow-300 font-semibold text-base px-8 h-11 transition-all duration-300 hover:shadow-[0_0_20px_rgba(251,191,36,0.3)]">
              {uc.ctaLabel}
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* FOLD 1: Empathetic H1 + pain recognition + CTA */}
        <section className="px-4 md:px-8 pt-16 md:pt-24 pb-16 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-[1.1] mb-8">
            {uc.h1}
          </h1>
          <p className="text-lg md:text-xl text-gray-400 leading-relaxed mb-10">
            {uc.painStatement}
          </p>
          <Link href="/login" className="inline-flex items-center">
            <Button className="bg-yellow-400 text-black hover:bg-yellow-300 font-semibold text-lg px-10 h-14 transition-all duration-300 hover:shadow-[0_0_40px_rgba(251,191,36,0.3)]">
              {uc.ctaLabel}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-sm text-gray-500 mt-3">{uc.ctaSubtext}</p>
        </section>

        {/* FOLD 2: How Rumi helps + why different */}
        <section className="px-4 md:px-8 py-16 border-t border-white/[0.06] bg-gray-950/50">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
              What happens when you talk to Rumi
            </h2>
            <p className="text-base md:text-lg text-gray-400 leading-relaxed mb-10">
              {uc.rumiResponse}
            </p>
            <div className="p-6 rounded-2xl border border-white/[0.06] bg-black">
              <h3 className="text-lg font-semibold text-yellow-400 mb-3">
                Why this is different
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {uc.whyDifferent}
              </p>
            </div>
          </div>
        </section>

        {/* FOLD 3: Privacy + safety + second CTA */}
        <section className="px-4 md:px-8 py-16 border-t border-white/[0.06]">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-start gap-4 mb-8">
              <div className="w-10 h-10 rounded-full bg-yellow-400/10 flex items-center justify-center flex-shrink-0 mt-1">
                <Shield className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Completely private
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Your sessions are confidential and never shared with third
                  parties. Enterprise-grade security. No data selling. What you
                  say stays between you and Rumi.
                </p>
              </div>
            </div>

            {uc.isSensitive && uc.safetyNote && (
              <div className="p-5 rounded-xl border border-yellow-400/20 bg-yellow-400/5 mb-10">
                <p className="text-sm text-gray-300 leading-relaxed">
                  {uc.safetyNote}
                </p>
              </div>
            )}

            <div className="text-center pt-6">
              <Link href="/login" className="inline-flex items-center">
                <Button className="bg-yellow-400 text-black hover:bg-yellow-300 font-semibold text-lg px-10 h-14 transition-all duration-300 hover:shadow-[0_0_40px_rgba(251,191,36,0.3)]">
                  {uc.ctaLabel}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center justify-center gap-2 mt-4">
                <Lock className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-gray-500">
                  No credit card. Free during beta.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* FOLD 4: Related use cases */}
        {related.length > 0 && (
          <section className="px-4 md:px-8 py-16 border-t border-white/[0.06] bg-gray-950/50">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-xl font-semibold text-white mb-6">
                Rumi also helps with
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/for/${r.slug}`}
                    className="p-5 rounded-xl border border-white/[0.06] bg-black hover:border-yellow-400/30 transition-colors"
                  >
                    <p className="font-semibold text-white mb-1">{r.h1}</p>
                    <p className="text-sm text-gray-500">
                      {r.metaDescription.slice(0, 80)}...
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Minimal footer */}
      <footer className="w-full py-8 border-t border-white/[0.06] bg-black">
        <div className="max-w-3xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <Link href="/" aria-label="Rumi home">
            <Image
              src="/rumi_logo.png"
              alt="Rumi Logo"
              width={607}
              height={202}
              className="h-[40px] w-auto opacity-60"
            />
          </Link>
          <p className="text-sm text-gray-600">
            &copy;2026 Rumi, Inc. Made in California.
          </p>
        </div>
      </footer>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/90 backdrop-blur-lg border-t border-white/[0.06] md:hidden z-40">
        <Link href="/login" className="block">
          <Button className="w-full bg-yellow-400 text-black hover:bg-yellow-300 font-semibold text-base h-12">
            {uc.ctaLabel}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
