"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Play, Pause } from "lucide-react"
import { cn } from "@/lib/utils"
import { OnboardingButton } from "../shared"
import { useOnboardingStore } from "@/store/onboardingStore"

interface VoiceSelectionScreenProps {
  onNext: () => void
  onSkip: () => void
}

interface Persona {
  id: string
  name: string
  age: string
  accent: string
  color: string
}

const PERSONAS: Persona[] = [
  { id: "aria", name: "Aria", age: "30s", accent: "Warm, American", color: "#FFD41A" },
  { id: "james", name: "James", age: "40s", accent: "Calm, British", color: "#60A5FA" },
  { id: "luna", name: "Luna", age: "20s", accent: "Friendly, Australian", color: "#A78BFA" },
  { id: "marcus", name: "Marcus", age: "50s", accent: "Steady, American", color: "#34D399" },
  { id: "sofia", name: "Sofia", age: "30s", accent: "Gentle, European", color: "#FB923C" },
  { id: "kai", name: "Kai", age: "30s", accent: "Soothing, Pacific", color: "#F472B6" },
]

export function VoiceSelectionScreen({ onNext, onSkip }: VoiceSelectionScreenProps) {
  const { voicePersonaId, setField } = useOnboardingStore()
  const [selected, setSelected] = useState(voicePersonaId || "")
  const [playing, setPlaying] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  function handlePlay(personaId: string) {
    // Stop current audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    if (playing === personaId) {
      setPlaying(null)
      return
    }

    // Placeholder: in production, load from /audio/personas/{id}.mp3
    setPlaying(personaId)
    // Auto-stop after 3s (placeholder for actual audio)
    const timeout = setTimeout(() => setPlaying(null), 3000)
    return () => clearTimeout(timeout)
  }

  function handleSelect(id: string) {
    setSelected(id)
  }

  function handleNext() {
    if (selected) {
      setField("voicePersonaId", selected)
      onNext()
    }
  }

  const selectedPersona = PERSONAS.find((p) => p.id === selected)

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-between bg-[#080808] px-6 py-12">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-2xl font-bold text-white"
      >
        Choose your coach&apos;s voice
      </motion.h1>

      <div className="grid w-full max-w-md grid-cols-2 gap-3 sm:grid-cols-3">
        {PERSONAS.map((persona, i) => (
          <motion.button
            key={persona.id}
            type="button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            onClick={() => handleSelect(persona.id)}
            className={cn(
              "relative flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all",
              selected === persona.id
                ? "border-[#FFD41A] bg-[#FFD41A]/10"
                : "border-white/10 bg-white/5 hover:border-white/20"
            )}
          >
            {/* Avatar placeholder */}
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white"
              style={{ backgroundColor: persona.color + "30" }}
            >
              {persona.name[0]}
            </div>
            <div className="text-[14px] font-medium text-white">{persona.name}</div>
            <div className="text-[12px] text-white/40">{persona.accent}</div>

            {/* Play button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handlePlay(persona.id)
              }}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/10"
            >
              {playing === persona.id ? (
                <Pause className="h-3.5 w-3.5 text-[#FFD41A]" />
              ) : (
                <Play className="h-3.5 w-3.5 text-white/60" />
              )}
            </button>
          </motion.button>
        ))}
      </div>

      <div className="flex w-full max-w-sm flex-col gap-3">
        <OnboardingButton onClick={handleNext} disabled={!selected}>
          {selectedPersona
            ? `Continue with ${selectedPersona.name}`
            : "Select a voice"}
        </OnboardingButton>
        <button
          type="button"
          onClick={onSkip}
          className="text-sm text-white/40 hover:text-white/60"
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}
