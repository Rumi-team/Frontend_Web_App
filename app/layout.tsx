import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { PostHogProvider } from "@/components/posthog-provider"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
}

const siteUrl = "https://www.rumi.team"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Rumi — Your Personal Transformational Leader",
  description:
    "Meet Rumi, your AI transformational leader. Proven programs deliver lasting change — 24/7, on your phone, at a fraction of traditional coaching costs.",
  keywords: [
    "AI life coach",
    "AI coaching",
    "transformational leadership",
    "personal development",
    "mental wellness",
    "voice AI coach",
    "Rumi",
  ],
  authors: [{ name: "Rumi", url: siteUrl }],
  creator: "Rumi",
  publisher: "Rumi",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Rumi — Your Personal Transformational Leader",
    description:
      "Meet Rumi, your AI transformational leader. Proven programs deliver lasting change — 24/7, on your phone, at a fraction of traditional coaching costs.",
    url: siteUrl,
    siteName: "Rumi",
    images: [
      {
        url: "/rumi_logo.png",
        width: 773,
        height: 427,
        alt: "Rumi — Your Personal Transformational Leader",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rumi — Your Personal Transformational Leader",
    description:
      "Meet Rumi, your AI transformational leader. Proven programs deliver lasting change — 24/7.",
    images: ["/rumi_logo.png"],
  },
  // TODO: Add Google Search Console verification code here after verifying at
  // https://search.google.com/search-console (Property → HTML tag method)
  // verification: {
  //   google: "YOUR_GOOGLE_VERIFICATION_CODE_HERE",
  //   other: {
  //     "msvalidate.01": "YOUR_BING_VERIFICATION_CODE_HERE",
  //   },
  // },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Rumi",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/rumi_logo.png`,
        width: 773,
        height: 427,
      },
      description:
        "AI transformational leadership coaching — 24/7 on your phone, at a fraction of traditional coaching costs.",
      sameAs: ["https://rumiagent.com"],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Rumi",
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
    },
    {
      "@type": "SoftwareApplication",
      name: "Rumi",
      applicationCategory: "LifestyleApplication",
      operatingSystem: "iOS, Android, Web",
      url: siteUrl,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to Google Fonts origin for faster font loading (LCP improvement) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* JSON-LD structured data: Organization + WebSite + SoftwareApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <PostHogProvider>
            {children}
          </PostHogProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
