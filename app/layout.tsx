import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export const metadata: Metadata = {
  title: "Rumi — Your Personal Transformational Leader",
  description: "Meet Rumi, your AI transformational leader. Proven programs deliver lasting change — 24/7, on your phone, at a fraction of traditional coaching costs.",
  generator: 'Rumi.Team',
  openGraph: {
    title: "Rumi — Your Personal Transformational Leader",
    description: "Meet Rumi, your AI transformational leader. Proven programs deliver lasting change — 24/7, on your phone, at a fraction of traditional coaching costs.",
    siteName: "Rumi",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
