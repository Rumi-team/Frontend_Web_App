"use client"

import { useState } from "react"
import Image from "next/image"
import { useOnboardingStore } from "@/store/onboardingStore"

const SKIN_TONES = [
  "#FFDFC4", "#F0C8A0", "#D4A574", "#C68642",
  "#A0522D", "#8B4513", "#654321", "#3B2219",
]

const FEMALE_AVATARS = ["/avatars/female_1.png", "/avatars/female_2.png"]
const MALE_AVATARS = ["/avatars/male_1.png", "/avatars/male_2.png"]

const EXPRESSIONS = [
  { id: "determined", label: "Determined", emoji: "💪" },
  { id: "curious", label: "Curious", emoji: "🤔" },
  { id: "calm", label: "Calm", emoji: "🧘" },
  { id: "bold", label: "Bold", emoji: "⚡" },
]

interface AvatarCreatorScreenProps {
  onNext: () => void
  onSkip?: () => void
  onBack?: () => void
}

export function AvatarCreatorScreen({ onNext, onSkip, onBack }: AvatarCreatorScreenProps) {
  const gender = useOnboardingStore((s) => s.gender)
  const avatars = gender === "female" ? FEMALE_AVATARS : MALE_AVATARS

  const [selectedAvatar, setSelectedAvatar] = useState(0)
  const [selectedTone, setSelectedTone] = useState(3)
  const [selectedExpression, setSelectedExpression] = useState("determined")

  const handleContinue = () => {
    // Store avatar config for later use
    if (typeof window !== "undefined") {
      localStorage.setItem("rumi_avatar", JSON.stringify({
        base: avatars[selectedAvatar],
        skinTone: SKIN_TONES[selectedTone],
        expression: selectedExpression,
        gender: gender || "neutral",
      }))
    }
    onNext()
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[#1A1A1A] px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        {onBack && (
          <button onClick={onBack} className="text-gray-400 text-sm">
            ← Back
          </button>
        )}
        {onSkip && (
          <button onClick={onSkip} className="text-gray-400 text-sm ml-auto">
            Skip
          </button>
        )}
      </div>

      <h1
        className="text-2xl font-extrabold text-white text-center mb-2"
        style={{ fontFamily: "var(--font-nunito, Nunito), sans-serif" }}
      >
        Create Your Avatar
      </h1>
      <p className="text-sm text-gray-400 text-center mb-8">
        This is how you&apos;ll appear in the app. Your avatar evolves as you progress.
      </p>

      {/* Avatar preview */}
      <div className="flex justify-center mb-8">
        <div
          className="w-32 h-32 rounded-full overflow-hidden flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, #F5C518, #FF6B35)`,
            border: "4px solid #F5C518",
            boxShadow: "0 0 0 6px rgba(245,197,24,0.2), 0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          <Image
            src={avatars[selectedAvatar]}
            alt="Avatar preview"
            width={112}
            height={112}
            className="object-cover"
          />
        </div>
      </div>

      {/* Avatar selection */}
      <div className="mb-6">
        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">
          Choose your look
        </p>
        <div className="flex gap-3 justify-center">
          {avatars.map((src, i) => (
            <button
              key={src}
              onClick={() => setSelectedAvatar(i)}
              className={`w-20 h-20 rounded-[14px] overflow-hidden transition-all ${
                selectedAvatar === i
                  ? "ring-2 ring-[#F5C518] ring-offset-2 ring-offset-[#1A1A1A]"
                  : "opacity-50"
              }`}
            >
              <Image src={src} alt={`Avatar ${i + 1}`} width={80} height={80} className="object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Skin tone */}
      <div className="mb-6">
        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">
          Skin tone
        </p>
        <div className="flex gap-2 justify-center">
          {SKIN_TONES.map((tone, i) => (
            <button
              key={tone}
              onClick={() => setSelectedTone(i)}
              className={`w-9 h-9 rounded-full transition-all ${
                selectedTone === i
                  ? "ring-2 ring-[#F5C518] ring-offset-2 ring-offset-[#1A1A1A] scale-110"
                  : ""
              }`}
              style={{ background: tone }}
            />
          ))}
        </div>
      </div>

      {/* Expression */}
      <div className="mb-8">
        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">
          Your vibe
        </p>
        <div className="grid grid-cols-2 gap-3">
          {EXPRESSIONS.map((expr) => (
            <button
              key={expr.id}
              onClick={() => setSelectedExpression(expr.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-[14px] transition-all ${
                selectedExpression === expr.id
                  ? "bg-[#F5C518]/20 border-2 border-[#F5C518]"
                  : "bg-[#242424] border-2 border-transparent"
              }`}
            >
              <span className="text-xl">{expr.emoji}</span>
              <span className={`text-sm font-semibold ${
                selectedExpression === expr.id ? "text-[#F5C518]" : "text-gray-300"
              }`}>
                {expr.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Continue button */}
      <div className="mt-auto">
        <button
          onClick={handleContinue}
          className="w-full py-4 rounded-[14px] text-lg font-extrabold uppercase tracking-wider"
          style={{
            background: "#F5C518",
            color: "#1A1A1A",
            boxShadow: "0 4px 0 #C49B00",
            fontFamily: "var(--font-nunito, Nunito), sans-serif",
          }}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
