"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@/components/auth-provider"
import { useUserStore } from "@/store/userStore"
import { useSessionStore } from "@/store/sessionStore"
import { useSettingsStore } from "@/store/settingsStore"
import { SlideToStart } from "@/components/app/shared/SlideToStart"
import { SplashIntro, hasSplashPlayed } from "@/components/app/phone/SplashIntro"

const THEME_IMAGES: Record<string, string> = {
  forest_light: "/themes/forest-light.jpg",
  mountain_lake: "/themes/mountain-lake.jpg",
  ocean_horizon: "/themes/ocean-horizon.jpg",
  sunset_sky: "/themes/sunset-sky.jpg",
}

const QUOTES = [
  { text: "The wound is the place where the Light enters you.", author: "Rumi" },
  { text: "What you seek is seeking you.", author: "Rumi" },
  { text: "You were born with wings, why prefer to crawl through life?", author: "Rumi" },
  { text: "Let yourself be silently drawn by the stronger pull of what you really love.", author: "Rumi" },
  { text: "Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.", author: "Rumi" },
  { text: "Don't be satisfied with stories, how things have gone with others. Unfold your own myth.", author: "Rumi" },
  { text: "The only lasting beauty is the beauty of the heart.", author: "Rumi" },
  { text: "As you start to walk on the way, the way appears.", author: "Rumi" },
  { text: "The only way out is through.", author: "Robert Frost" },
  { text: "I can do it. I'm going to do it.", author: "You" },
  { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
]

export function HomeScreen() {
  const router = useRouter()
  const { displayName } = useAuth()
  const streak = useUserStore((s) => s.streak)
  const startSession = useSessionStore((s) => s.startSession)
  const selectedTheme = useSettingsStore((s) => s.selectedTheme)
  const selectedVoice = useSettingsStore((s) => s.selectedVoice)
  const showQuote = useSettingsStore((s) => s.homeScreenQuote)

  const [splashDone, setSplashDone] = useState(hasSplashPlayed)

  const bgImage = THEME_IMAGES[selectedTheme] || THEME_IMAGES.forest_light
  const quote = QUOTES[new Date().getDate() % QUOTES.length]

  const handleStartSession = () => {
    startSession()
    router.replace("/phone/session/loading")
  }

  const handleSplashComplete = useCallback(() => {
    setSplashDone(true)
  }, [])

  // Delay multiplier: content fades in staggered after splash
  const reveal = splashDone ? 1 : 0

  return (
    <div className="relative flex flex-col min-h-[calc(100dvh-72px)] overflow-hidden">
      {/* Cinematic splash intro (once per session) */}
      {!splashDone && <SplashIntro onComplete={handleSplashComplete} />}

      {/* Full-screen background image */}
      <motion.div
        className="absolute inset-0"
        initial={!splashDone ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: splashDone ? 0 : 1.8 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bgImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
      </motion.div>

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col flex-1 items-center justify-between px-6 py-8">
        {/* Top: Rumi icon + name badge */}
        <motion.div
          className="flex flex-col items-center gap-2 pt-4"
          initial={!splashDone ? { opacity: 0 } : false}
          animate={{ opacity: reveal }}
          transition={{ duration: 0.5, delay: 3.2 }}
        >
          <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-white/30 shadow-lg bg-[#1A1A1A]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/mascot/rumi_app_icon.png"
              alt="Rumi"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex items-center gap-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full px-4 py-1.5 shadow-sm">
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">Rumi</span>
            <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
          </div>
        </motion.div>

        {/* Center: Quote */}
        {showQuote && (
          <motion.div
            className="flex flex-col items-center gap-2 text-center max-w-md"
            initial={!splashDone ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: splashDone ? 0 : 3.0 }}
          >
            <p
              className="text-xl italic text-white font-serif leading-relaxed"
              style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}
            >
              {quote.text}
            </p>
            <p
              className="text-sm text-white/70"
              style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}
            >
              — {quote.author}
            </p>
          </motion.div>
        )}

        {/* Bottom: Slide to start */}
        <motion.div
          className="w-full max-w-sm"
          initial={!splashDone ? { opacity: 0, y: 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: splashDone ? 0 : 3.2 }}
        >
          <SlideToStart onComplete={handleStartSession} />
        </motion.div>
      </div>
    </div>
  )
}
