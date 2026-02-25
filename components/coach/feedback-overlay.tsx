"use client"

import { useState, useEffect, useCallback } from "react"
import { RumiMascot, type MascotMood } from "./rumi-mascot"
import { useAuth } from "@/components/auth-provider"
import { createSupabaseBrowserClient } from "@/lib/supabase-auth-browser"

type Rating = "great" | "ok" | "needs_work"
type Pacing = "too_fast" | "just_right" | "too_slow"

interface FeedbackOverlayProps {
  sessionId: string
  onComplete: () => void
}

const RATING_OPTIONS: { value: Rating; emoji: string; label: string }[] = [
  { value: "great", emoji: "😊", label: "Great" },
  { value: "ok", emoji: "😐", label: "OK" },
  { value: "needs_work", emoji: "😕", label: "Needs work" },
]

const PACING_OPTIONS: { value: Pacing; emoji: string; label: string }[] = [
  { value: "too_fast", emoji: "🐇", label: "Too fast" },
  { value: "just_right", emoji: "👌", label: "Just right" },
  { value: "too_slow", emoji: "🐢", label: "Too slow" },
]

interface FeedbackCategory {
  key: string
  question: string
  type: "rating" | "pacing"
}

const CATEGORIES: FeedbackCategory[] = [
  { key: "overall_quality", question: "How was your session?", type: "rating" },
  { key: "agent_listening", question: "Did Rumi understand you?", type: "rating" },
  { key: "pacing", question: "How was the pacing?", type: "pacing" },
  { key: "coaching_depth", question: "Depth of coaching?", type: "rating" },
]

export function FeedbackOverlay({ sessionId, onComplete }: FeedbackOverlayProps) {
  const { providerUserId } = useAuth()
  const [visible, setVisible] = useState(false)
  const [mascotMood, setMascotMood] = useState<MascotMood>("celebrating")
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [suggestions, setSuggestions] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Animate in
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const totalSteps = CATEGORIES.length + 1 // categories + suggestions

  const handleSelect = useCallback(
    (key: string, value: string) => {
      setAnswers((prev) => ({ ...prev, [key]: value }))
      setMascotMood(value === "great" || value === "just_right" ? "impressed" : "thinking")

      // Auto-advance after a brief delay
      setTimeout(() => {
        setCurrentStep((s) => Math.min(s + 1, totalSteps - 1))
        setMascotMood("celebrating")
      }, 400)
    },
    [totalSteps]
  )

  const handleSubmit = useCallback(async () => {
    setSubmitting(true)
    setMascotMood("cheering")

    try {
      const supabase = createSupabaseBrowserClient()
      await supabase.from("user_feedback").insert({
        session_id: sessionId,
        provider_user_id: providerUserId,
        overall_quality: answers.overall_quality || null,
        agent_listening: answers.agent_listening || null,
        pacing: answers.pacing || null,
        coaching_depth: answers.coaching_depth || null,
        improvement_suggestions: suggestions.trim() || null,
      })
    } catch (err) {
      console.error("Failed to save feedback:", err)
    }

    setSubmitted(true)
    setTimeout(() => {
      setVisible(false)
      setTimeout(onComplete, 400)
    }, 1800)
  }, [sessionId, providerUserId, answers, suggestions, onComplete])

  const handleSkip = useCallback(() => {
    setVisible(false)
    setTimeout(onComplete, 400)
  }, [onComplete])

  const category = currentStep < CATEGORIES.length ? CATEGORIES[currentStep] : null
  const isLastCategory = currentStep >= CATEGORIES.length
  const progress = ((currentStep + (isLastCategory ? 1 : 0)) / totalSteps) * 100

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-400
        ${visible ? "opacity-100" : "opacity-0"}`}
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(250,204,21,0.06) 0%, rgba(0,0,0,0.94) 70%)",
      }}
    >
      <div
        className={`flex flex-col items-center w-full max-w-sm px-6 text-center transform transition-all duration-500
          ${visible ? "translate-y-0 scale-100" : "translate-y-8 scale-95"}`}
      >
        {/* Mascot */}
        <div className="animate-mascot-entrance mb-2">
          <RumiMascot mood={mascotMood} size={120} />
        </div>

        {submitted ? (
          /* ── Thank you state ── */
          <div className="flex flex-col items-center gap-3 animate-mascot-entrance">
            <h2
              className="text-2xl font-bold"
              style={{ color: "rgb(250, 204, 21)" }}
            >
              Thank you!
            </h2>
            <p className="text-gray-400 text-sm">
              Your feedback helps Rumi grow
            </p>
            {/* Sparkle particles */}
            <div className="relative w-16 h-16">
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <div
                  key={deg}
                  className="absolute inset-0 animate-mascot-sparkle-particle"
                  style={
                    {
                      "--rotation": `${deg}deg`,
                      animationDelay: `${deg / 600}s`,
                    } as React.CSSProperties
                  }
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: "rgb(250, 204, 21)" }}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ── Feedback form ── */
          <>
            {/* Progress bar */}
            <div
              className="w-full h-1.5 rounded-full overflow-hidden mb-5"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  background:
                    "linear-gradient(90deg, rgb(250,204,21), rgb(255,160,0))",
                }}
              />
            </div>

            {/* Speech bubble */}
            <div
              className="relative rounded-2xl px-5 py-3 mb-6 max-w-[300px]"
              style={{
                backgroundColor: "rgba(255, 230, 133, 0.95)",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
              }}
            >
              <p
                className="text-lg font-semibold"
                style={{ color: "rgb(50, 34, 8)" }}
              >
                {category ? category.question : "Anything else I should know?"}
              </p>
              {/* Bubble tail */}
              <div
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0"
                style={{
                  borderLeft: "8px solid transparent",
                  borderRight: "8px solid transparent",
                  borderBottom: "8px solid rgba(255, 230, 133, 0.95)",
                }}
              />
            </div>

            {category ? (
              /* ── Rating buttons ── */
              <div className="flex gap-3 mb-6">
                {(category.type === "rating"
                  ? RATING_OPTIONS
                  : PACING_OPTIONS
                ).map((opt, i) => {
                  const selected = answers[category.key] === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleSelect(category.key, opt.value)}
                      className={`flex flex-col items-center gap-1.5 px-5 py-3 rounded-2xl
                        transition-all duration-200 border-2
                        ${
                          selected
                            ? "border-yellow-400 bg-yellow-400/15 scale-105"
                            : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                        }`}
                      style={{
                        animationDelay: `${i * 80}ms`,
                        animation: visible
                          ? `mascot-entrance 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 80}ms both`
                          : "none",
                      }}
                    >
                      <span className="text-3xl">{opt.emoji}</span>
                      <span
                        className={`text-xs font-medium ${
                          selected ? "text-yellow-300" : "text-gray-400"
                        }`}
                      >
                        {opt.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            ) : (
              /* ── Free text suggestions ── */
              <div className="w-full mb-5">
                <textarea
                  value={suggestions}
                  onChange={(e) => setSuggestions(e.target.value)}
                  placeholder="Tell me what I can improve..."
                  rows={3}
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500
                    border border-white/10 bg-white/5 focus:border-yellow-400/50 focus:outline-none
                    focus:ring-1 focus:ring-yellow-400/30 resize-none transition-all"
                  onFocus={() => setMascotMood("thinking")}
                  onBlur={() => setMascotMood("celebrating")}
                />
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={handleSkip}
                className="flex-1 px-4 py-2.5 rounded-full text-sm font-medium
                  text-gray-400 hover:text-gray-300 bg-white/5 hover:bg-white/10
                  border border-white/5 transition-all"
              >
                Skip
              </button>
              {isLastCategory && (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 rounded-full text-sm font-bold
                    text-black transition-all disabled:opacity-50"
                  style={{
                    background:
                      "linear-gradient(135deg, rgb(250,204,21), rgb(255,160,0))",
                    boxShadow: "0 4px 16px rgba(250,204,21,0.3)",
                  }}
                >
                  {submitting ? "Sending..." : "Submit"}
                </button>
              )}
            </div>

            {/* Step indicator dots */}
            <div className="flex gap-2 mt-4">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i < currentStep
                      ? "w-6 bg-yellow-400"
                      : i === currentStep
                        ? "w-6 bg-yellow-400/50"
                        : "w-1.5 bg-gray-700"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
