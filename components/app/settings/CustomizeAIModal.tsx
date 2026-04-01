"use client"

import { useState, useRef } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useSettingsStore } from "@/store/settingsStore"
import { Play, Pause } from "lucide-react"
import Image from "next/image"

interface CustomizeAIModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const VOICES = [
  { id: "Puck", description: "Bright & upbeat", personality: "Energetic, encouraging", color: "#FFD41A" },
  { id: "Charon", description: "Warm & resonant", personality: "Thoughtful, grounded", color: "#F59E0B" },
  { id: "Kore", description: "Gentle & calm", personality: "Patient, nurturing", color: "#A78BFA" },
  { id: "Fenrir", description: "Bold & direct", personality: "Confident, action-oriented", color: "#EF4444" },
  { id: "Aoede", description: "Lyrical & flowing", personality: "Creative, expressive", color: "#EC4899" },
  { id: "Leda", description: "Calm & steady", personality: "Composed, reassuring", color: "#60A5FA" },
  { id: "Orus", description: "Deep & grounded", personality: "Wise, contemplative", color: "#34D399" },
  { id: "Zephyr", description: "Light & breezy", personality: "Friendly, approachable", color: "#FB923C" },
]

const STYLES = [
  { id: "gentle", label: "Gentle & Warm" },
  { id: "direct", label: "Direct & Clear" },
  { id: "motivational", label: "Motivational" },
  { id: "analytical", label: "Analytical" },
]

export function CustomizeAIModal({ open, onOpenChange }: CustomizeAIModalProps) {
  const selectedVoice = useSettingsStore((s) => s.selectedVoice)
  const aiStyle = useSettingsStore((s) => s.aiStyle)
  const customInstructions = useSettingsStore((s) => s.customInstructions)
  const radarCalibration = useSettingsStore((s) => s.radarCalibration)
  const setField = useSettingsStore((s) => s.setField)

  const [playing, setPlaying] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  function handlePlay(voiceId: string) {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    if (playing === voiceId) { setPlaying(null); return }
    setPlaying(voiceId)
    const audio = new Audio(`/audio/personas/${voiceId}.mp3`)
    audioRef.current = audio
    audio.play().catch(() => {})
    audio.onended = () => setPlaying(null)
    audio.onerror = () => setTimeout(() => setPlaying(null), 2000)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl bg-white dark:bg-gray-900 max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-gray-900 dark:text-gray-100">Customize your AI</SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Voice</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {VOICES.map((voice) => (
              <button
                key={voice.id}
                onClick={() => setField("selectedVoice", voice.id)}
                className={`relative flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all ${
                  selectedVoice === voice.id
                    ? "border-amber-500 bg-amber-500/10 dark:bg-amber-500/20"
                    : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full overflow-hidden" style={{ backgroundColor: voice.color + "25" }}>
                  <Image src={`/avatars/${voice.id.toLowerCase()}.png`} alt={voice.id} width={56} height={56} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none" }} />
                </div>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{voice.id}</div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">{voice.description}</div>
                <button type="button" onClick={(e) => { e.stopPropagation(); handlePlay(voice.id) }} aria-label={playing === voice.id ? `Stop ${voice.id} preview` : `Play ${voice.id} preview`} className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-gray-200/80 dark:bg-gray-600/80">
                  {playing === voice.id ? <Pause className="h-3.5 w-3.5 text-amber-600" /> : <Play className="h-3.5 w-3.5 text-gray-600 dark:text-gray-300" />}
                </button>
              </button>
            ))}
          </div>
          <div aria-live="polite" className="sr-only">{playing ? `Playing ${playing} voice preview` : ""}</div>
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">AI Style</p>
          <div className="flex flex-col gap-2">
            {STYLES.map((style) => (
              <button key={style.id} onClick={() => setField("aiStyle", style.id)} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${aiStyle === style.id ? "bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}>
                <div className={`h-4 w-4 rounded-full border-2 ${aiStyle === style.id ? "border-white dark:border-gray-900 bg-white dark:bg-gray-900" : "border-gray-300 dark:border-gray-600"}`}>
                  {aiStyle === style.id && <div className="h-full w-full rounded-full bg-gray-800 dark:bg-gray-200 scale-50" />}
                </div>
                {style.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Calibration</p>
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4">
            {Object.entries(radarCalibration).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between py-1">
                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                <div className="h-1.5 w-24 rounded-full bg-gray-200 dark:bg-gray-700">
                  <div className="h-full rounded-full bg-green-500" style={{ width: `${(value as number) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Custom Instructions</p>
          <textarea value={customInstructions} onChange={(e) => setField("customInstructions", e.target.value)} placeholder="Add any special instructions for your AI coach..." className="w-full min-h-[80px] rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-gray-400 dark:focus:border-gray-500 resize-none" />
        </div>
      </SheetContent>
    </Sheet>
  )
}
