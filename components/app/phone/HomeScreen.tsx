"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { useSettingsStore } from "@/store/settingsStore"
import { useSessionStore } from "@/store/sessionStore"
import { SlideToStart } from "@/components/app/shared/SlideToStart"

const THEME_IMAGES: Record<string, string> = {
  forest_light: "/themes/forest-light.jpg",
  mountain_lake: "/themes/mountain-lake.jpg",
  ocean_horizon: "/themes/ocean-horizon.jpg",
  sunset_sky: "/themes/sunset-sky.jpg",
}

const QUOTES = [
  // Rumi
  { text: "The wound is the place where the Light enters you.", author: "Rumi" },
  { text: "What you seek is seeking you.", author: "Rumi" },
  { text: "Don't be satisfied with stories, how things have gone with others. Unfold your own myth.", author: "Rumi" },
  { text: "Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.", author: "Rumi" },
  { text: "You were born with wings. Why prefer to crawl through life?", author: "Rumi" },
  // Transformational leaders
  { text: "What you resist, persists.", author: "Carl Jung" },
  { text: "The only way out is through.", author: "Robert Frost" },
  { text: "Between stimulus and response there is a space. In that space is our freedom.", author: "Viktor Frankl" },
  { text: "When you change the way you look at things, the things you look at change.", author: "Wayne Dyer" },
  { text: "The cave you fear to enter holds the treasure you seek.", author: "Joseph Campbell" },
  { text: "No problem can be solved from the same level of consciousness that created it.", author: "Albert Einstein" },
  { text: "Until you make the unconscious conscious, it will direct your life and you will call it fate.", author: "Carl Jung" },
]

export function HomeScreen() {
  const router = useRouter()
  const { displayName } = useAuth()
  const selectedTheme = useSettingsStore((s) => s.selectedTheme)
  const showQuote = useSettingsStore((s) => s.homeScreenQuote)
  const startSession = useSessionStore((s) => s.startSession)

  const bgImage = THEME_IMAGES[selectedTheme] || THEME_IMAGES.forest_light
  // Rotate quotes daily based on date
  const dayIndex = new Date().getDate() % QUOTES.length
  const quote = QUOTES[dayIndex]
  const initial = (displayName || "U").charAt(0).toUpperCase()

  const handleSlideComplete = () => {
    startSession()
    router.replace("/phone/session/loading")
  }

  return (
    <div className="relative flex h-full min-h-dvh flex-col items-center justify-between">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-between px-6 pb-28 pt-16 w-full">
        {/* Avatar + name */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200/80 shadow-lg">
            <span className="text-2xl font-medium text-gray-600">{initial}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 shadow-sm">
            <span className="text-sm font-medium text-gray-800">Rumi</span>
            <div className="h-2 w-2 rounded-full bg-green-500" />
          </div>
        </div>

        {/* Quote */}
        {showQuote && (
          <div className="flex flex-col items-center gap-1 text-center" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.7)" }}>
            <p className="text-lg italic text-white font-serif">
              {quote.text}
            </p>
            <p className="text-sm text-white/80">{quote.author}</p>
          </div>
        )}

        {/* Slide to start */}
        <div className="w-full max-w-sm">
          <SlideToStart onComplete={handleSlideComplete} />
        </div>
      </div>
    </div>
  )
}
