"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Play, Pause, ChevronLeft, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { OnboardingButton } from "../shared"
import { useOnboardingStore } from "@/store/onboardingStore"

interface VoiceSelectionScreenProps {
  onNext: () => void
  onSkip: () => void
  onBack?: () => void
}

interface GeminiVoice {
  id: string // Exact Gemini API voice name
  description: string
  personality: string
  color: string
}

// Real Gemini Live API voices — these IDs pass directly to the backend
const VOICES: GeminiVoice[] = [
  { id: "Gacrux", description: "Warm & grounding", personality: "Steady, present", color: "#34D399" },
  { id: "Fenrir", description: "Bold & direct", personality: "Confident, action-oriented", color: "#EF4444" },
  { id: "Leda", description: "Calm & steady", personality: "Composed, reassuring", color: "#60A5FA" },
  { id: "Aoede", description: "Lyrical & flowing", personality: "Creative, expressive", color: "#EC4899" },
  { id: "Enceladus", description: "Deep & resonant", personality: "Wise, contemplative", color: "#8B5CF6" },
  { id: "Erinome", description: "Gentle & nurturing", personality: "Patient, empathetic", color: "#F59E0B" },
  { id: "Algenib", description: "Clear & focused", personality: "Analytical, precise", color: "#06B6D4" },
  { id: "Achernar", description: "Bright & uplifting", personality: "Optimistic, energizing", color: "#FFD41A" },
  { id: "Sulafat", description: "Soft & reflective", personality: "Thoughtful, introspective", color: "#FB923C" },
]

type AudioState = "idle" | "loading" | "playing" | "error"

export function VoiceSelectionScreen({ onNext, onSkip, onBack }: VoiceSelectionScreenProps) {
  const { voicePersonaId, setField } = useOnboardingStore()
  const [selected, setSelected] = useState(voicePersonaId || "")
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [audioState, setAudioState] = useState<AudioState>("idle")
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.removeAttribute("src")
        audioRef.current = null
      }
    }
  }, [])

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setPlayingId(null)
    setAudioState("idle")
  }, [])

  const handlePlay = useCallback((personaId: string) => {
    // Toggle off if already playing this voice
    if (playingId === personaId) {
      stopAudio()
      return
    }

    // Stop current audio
    if (audioRef.current) {
      audioRef.current.pause()
    }

    setPlayingId(personaId)
    setAudioState("loading")

    // Create single Audio instance or reuse existing
    if (!audioRef.current) {
      audioRef.current = new Audio()
    }

    const audio = audioRef.current

    const handleCanPlay = () => {
      setAudioState("playing")
      audio.play().catch(() => {
        setAudioState("error")
        setPlayingId(null)
      })
    }

    const handleEnded = () => {
      setPlayingId(null)
      setAudioState("idle")
    }

    const handleError = () => {
      setAudioState("error")
      setPlayingId(null)
    }

    // Remove old listeners before adding new ones
    audio.oncanplaythrough = handleCanPlay
    audio.onended = handleEnded
    audio.onerror = handleError

    // Set source and load
    audio.src = `/audio/personas/${personaId}.mp3`
    audio.load()
  }, [playingId, stopAudio])

  function handleSelect(id: string) {
    setSelected(id)
  }

  function handleNext() {
    if (selected) {
      stopAudio()
      setField("voicePersonaId", selected)
      onNext()
    }
  }

  const selectedVoice = VOICES.find((v) => v.id === selected)

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-between bg-[#080808] px-6 py-12">
      {onBack && (
        <button type="button" onClick={onBack} className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-white/50 hover:bg-white/5 hover:text-white/80">
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-2xl font-bold text-white"
      >
        Choose your coach&apos;s voice
      </motion.h1>

      <div className="grid w-full max-w-lg grid-cols-2 gap-3 sm:grid-cols-4">
        {VOICES.map((voice, i) => (
          <motion.button
            key={voice.id}
            type="button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
            onClick={() => handleSelect(voice.id)}
            className={cn(
              "relative flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all",
              selected === voice.id
                ? "border-[#FFD41A] bg-[#FFD41A]/10"
                : "border-white/10 bg-white/5 hover:border-white/20"
            )}
          >
            {/* Voice icon */}
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold text-white"
              style={{ backgroundColor: voice.color + "25" }}
            >
              {voice.id[0]}
            </div>
            <div className="text-[14px] font-semibold text-white">{voice.id}</div>
            <div className="text-[11px] text-white/50">{voice.description}</div>
            <div className="text-[10px] text-white/30">{voice.personality}</div>

            {/* Play preview button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handlePlay(voice.id)
              }}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
            >
              {playingId === voice.id && audioState === "loading" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#FFD41A]" />
              ) : playingId === voice.id && audioState === "playing" ? (
                <Pause className="h-3.5 w-3.5 text-[#FFD41A]" />
              ) : (
                <Play className="h-3.5 w-3.5 text-white/60" />
              )}
            </button>

            {/* Error indicator */}
            {playingId === voice.id && audioState === "error" && (
              <span className="absolute right-2 top-10 text-[9px] text-red-400">
                No preview
              </span>
            )}
          </motion.button>
        ))}
      </div>

      <div className="flex w-full max-w-sm flex-col gap-3">
        <OnboardingButton onClick={handleNext} disabled={!selected}>
          {selectedVoice
            ? `Continue with ${selectedVoice.id}`
            : "Select a voice"}
        </OnboardingButton>
        <button
          type="button"
          onClick={() => {
            stopAudio()
            onSkip()
          }}
          className="text-sm text-white/40 hover:text-white/60"
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}
