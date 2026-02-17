"use client"

import { useState, useRef, useCallback, useEffect } from "react"

interface LyricLine {
  startTime: number
  endTime: number
  fadeDuration: number
  text: string
}

const LYRICS: LyricLine[] = [
  // First verse
  { startTime: 20.0, endTime: 23.5, fadeDuration: 0.5, text: "O day, arise!" },
  { startTime: 24.0, endTime: 29.5, fadeDuration: 0.5, text: "The atoms are dancing" },
  { startTime: 30.0, endTime: 37.5, fadeDuration: 0.5, text: "Thanks to It, the universe is dancing" },
  { startTime: 38.0, endTime: 46.5, fadeDuration: 0.5, text: "The souls are dancing, overcome with ecstasy" },
  { startTime: 47.0, endTime: 58.5, fadeDuration: 0.5, text: "I'll whisper in your ear where their dance is taking them" },
  { startTime: 59.0, endTime: 66.5, fadeDuration: 0.5, text: "All the atoms in the air and in the desert" },
  { startTime: 67.0, endTime: 69.5, fadeDuration: 0.5, text: "know well, they seem insane" },
  { startTime: 69.0, endTime: 77.5, fadeDuration: 0.5, text: "is good natured, for like us, they are enchanted" },
  { startTime: 78.0, endTime: 87.5, fadeDuration: 0.5, text: "Every single atom, happy or miserable," },
  { startTime: 88.0, endTime: 105.0, fadeDuration: 0.5, text: "Becomes enamoured of the sun, of which nothing can be said" },
  // Instrumental bridge
  // Second verse
  { startTime: 140.0, endTime: 149.5, fadeDuration: 0.5, text: "O day, arise! The atoms are dancing" },
  { startTime: 150.0, endTime: 157.5, fadeDuration: 0.5, text: "Thanks to It, the universe is dancing" },
  { startTime: 158.0, endTime: 166.5, fadeDuration: 0.5, text: "The souls are dancing, overcome with ecstasy" },
  { startTime: 167.0, endTime: 178.5, fadeDuration: 0.5, text: "I'll whisper in your ear where their dance is taking them" },
  { startTime: 179.0, endTime: 186.5, fadeDuration: 0.5, text: "All the atoms in the air and in the desert" },
  { startTime: 187.0, endTime: 189.5, fadeDuration: 0.5, text: "know well, they seem insane" },
  { startTime: 189.0, endTime: 197.5, fadeDuration: 0.5, text: "is good natured, for like us, they are enchanted" },
  { startTime: 198.0, endTime: 207.5, fadeDuration: 0.5, text: "Every single atom, happy or miserable," },
  { startTime: 208.0, endTime: 230.0, fadeDuration: 0.5, text: "Becomes enamoured of the sun, of which nothing can be said" },
]

interface UseLyricsManagerReturn {
  currentLine: string | null
  lyricOpacity: number
  isMusicPlaying: boolean
  toggleMusic: () => void
  start: () => void
  stop: () => void
}

export function useLyricsManager(): UseLyricsManagerReturn {
  const [currentLine, setCurrentLine] = useState<string | null>(null)
  const [lyricOpacity, setLyricOpacity] = useState(0)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<number>(0)
  const currentIndexRef = useRef(-1)

  const updateLyric = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    const currentTime = audio.currentTime
    let newIndex = -1

    for (let i = 0; i < LYRICS.length; i++) {
      if (currentTime >= LYRICS[i].startTime && currentTime <= LYRICS[i].endTime) {
        newIndex = i
        break
      }
    }

    if (newIndex >= 0) {
      const lyric = LYRICS[newIndex]
      if (newIndex !== currentIndexRef.current) {
        currentIndexRef.current = newIndex
        setCurrentLine(lyric.text)
      }
      const elapsed = currentTime - lyric.startTime
      setLyricOpacity(elapsed < lyric.fadeDuration ? elapsed / lyric.fadeDuration : 1)
    } else {
      if (currentIndexRef.current !== -1) {
        currentIndexRef.current = -1
        setCurrentLine(null)
      }
      setLyricOpacity(0)
    }
  }, [])

  const start = useCallback(() => {
    if (audioRef.current) return // already playing

    const audio = new Audio("/rumi_poem.mp3")
    audio.volume = 1
    audioRef.current = audio

    audio.play().then(() => {
      setIsMusicPlaying(true)
      intervalRef.current = window.setInterval(updateLyric, 50)
    }).catch(() => {
      // Autoplay blocked — will start on next user interaction
    })
  }, [updateLyric])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    window.clearInterval(intervalRef.current)
    setCurrentLine(null)
    setLyricOpacity(0)
    setIsMusicPlaying(false)
    currentIndexRef.current = -1
  }, [])

  const toggleMusic = useCallback(() => {
    const audio = audioRef.current

    if (!audio) {
      // First time — start playing
      start()
      return
    }

    if (isMusicPlaying) {
      // Fade out
      let vol = audio.volume
      const fadeOut = setInterval(() => {
        vol = Math.max(0, vol - 0.05)
        audio.volume = vol
        if (vol <= 0) {
          clearInterval(fadeOut)
          audio.pause()
          setIsMusicPlaying(false)
        }
      }, 50)
    } else {
      // Fade in
      audio.volume = 0
      audio.play().catch(() => {})
      let vol = 0
      const fadeIn = setInterval(() => {
        vol = Math.min(1, vol + 0.05)
        audio.volume = vol
        if (vol >= 1) clearInterval(fadeIn)
      }, 50)
      setIsMusicPlaying(true)
      intervalRef.current = window.setInterval(updateLyric, 50)
    }
  }, [isMusicPlaying, start, updateLyric])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      window.clearInterval(intervalRef.current)
    }
  }, [])

  return { currentLine, lyricOpacity, isMusicPlaying, toggleMusic, start, stop }
}
