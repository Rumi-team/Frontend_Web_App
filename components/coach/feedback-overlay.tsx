"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"
import { createSupabaseBrowserClient } from "@/lib/supabase-auth-browser"

interface FeedbackOverlayProps {
  sessionId: string
  onComplete: () => void
}

const RATINGS = [
  { value: 1, emoji: "\u{1F61E}", label: "Poor" },
  { value: 2, emoji: "\u{1F615}", label: "Meh" },
  { value: 3, emoji: "\u{1F610}", label: "OK" },
  { value: 4, emoji: "\u{1F60A}", label: "Good" },
  { value: 5, emoji: "\u{1F929}", label: "Great" },
]

function npsCategory(score: number): "detractor" | "passive" | "promoter" {
  if (score <= 6) return "detractor"
  if (score <= 8) return "passive"
  return "promoter"
}

export function FeedbackOverlay({ sessionId, onComplete }: FeedbackOverlayProps) {
  const { providerUserId } = useAuth()
  const [visible, setVisible] = useState(false)
  const [rating, setRating] = useState<number | null>(null)
  const [npsScore, setNpsScore] = useState<number | null>(null)
  const [comment, setComment] = useState("")
  const [step, setStep] = useState<"rate" | "nps" | "comment">("rate")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const submit = useCallback(async (
    finalRating: number,
    finalNps: number | null,
    finalComment: string,
  ) => {
    setSubmitting(true)
    try {
      const supabase = createSupabaseBrowserClient()
      await supabase.from("user_feedback").insert({
        session_id: sessionId,
        provider_user_id: providerUserId,
        overall_rating: finalRating,
        nps_score: finalNps,
        nps_category: finalNps !== null ? npsCategory(finalNps) : null,
        improvement_suggestions: finalComment.trim() || null,
        had_bugs: false,
        had_ui_issues: false,
      })
    } catch (err) {
      console.error("Failed to save feedback:", err)
    }
    setSubmitted(true)
    setTimeout(() => {
      setVisible(false)
      setTimeout(onComplete, 400)
    }, 1500)
  }, [sessionId, providerUserId, onComplete])

  const handleRating = useCallback((value: number) => {
    setRating(value)
    // Always proceed to NPS step
    setTimeout(() => setStep("nps"), 300)
  }, [])

  const handleNps = useCallback((value: number) => {
    setNpsScore(value)
    // For high NPS (9-10) + high rating (4-5), auto-submit
    if (value >= 9 && rating && rating >= 4) {
      submit(rating, value, "")
    } else {
      // Ask for comment when NPS is low or rating is low
      setTimeout(() => setStep("comment"), 300)
    }
  }, [rating, submit])

  const handleSubmitComment = useCallback(() => {
    if (rating) submit(rating, npsScore, comment)
  }, [rating, npsScore, comment, submit])

  const handleSkipComment = useCallback(() => {
    if (rating) submit(rating, npsScore, "")
  }, [rating, npsScore, submit])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-400
        ${visible ? "opacity-100" : "opacity-0"}`}
      style={{
        background: "radial-gradient(ellipse at center, rgba(250,204,21,0.06) 0%, rgba(0,0,0,0.94) 70%)",
      }}
    >
      <div
        className={`flex flex-col items-center w-full max-w-sm px-6 text-center transform transition-all duration-500
          ${visible ? "translate-y-0 scale-100" : "translate-y-8 scale-95"}`}
      >
        {/* Mascot */}
        <img
          src="/rumi_mascot.png"
          alt="Rumi"
          className="w-20 h-20 rounded-full object-cover mb-4"
        />

        {submitted ? (
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-xl font-bold text-yellow-400">Thank you!</h2>
            <p className="text-gray-400 text-sm">Your feedback helps Rumi grow</p>
          </div>
        ) : step === "rate" ? (
          <>
            <h2 className="text-lg font-semibold text-white mb-1">How was your session?</h2>
            <p className="text-gray-500 text-xs mb-5">Tap to rate</p>
            <div className="flex gap-3 mb-4">
              {RATINGS.map((r, i) => (
                <button
                  key={r.value}
                  onClick={() => handleRating(r.value)}
                  disabled={submitting}
                  className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl
                    transition-all duration-200 border-2
                    ${rating === r.value
                      ? "border-yellow-400 bg-yellow-400/15 scale-110"
                      : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                    }`}
                  style={{
                    animation: visible
                      ? `mascot-entrance 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 60}ms both`
                      : "none",
                  }}
                >
                  <span className="text-2xl">{r.emoji}</span>
                  <span className={`text-[10px] font-medium ${
                    rating === r.value ? "text-yellow-300" : "text-gray-500"
                  }`}>
                    {r.label}
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : step === "nps" ? (
          <>
            <h2 className="text-lg font-semibold text-white mb-1">
              Would you tell a friend about Rumi?
            </h2>
            <p className="text-gray-500 text-xs mb-4">0 = not likely &middot; 10 = absolutely</p>
            <div className="flex flex-wrap justify-center gap-2 mb-2">
              {Array.from({ length: 11 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handleNps(i)}
                  disabled={submitting}
                  className={`w-10 h-10 rounded-full text-sm font-bold
                    transition-all duration-200 border-2
                    ${npsScore === i
                      ? "border-yellow-400 bg-yellow-400/20 text-yellow-300 scale-110"
                      : i <= 6
                        ? "border-white/10 bg-white/5 text-gray-400 hover:border-red-400/30 hover:bg-red-400/10"
                        : i <= 8
                          ? "border-white/10 bg-white/5 text-gray-300 hover:border-yellow-400/30 hover:bg-yellow-400/10"
                          : "border-white/10 bg-white/5 text-white hover:border-green-400/30 hover:bg-green-400/10"
                    }`}
                  style={{
                    animation: visible
                      ? `mascot-entrance 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 30}ms both`
                      : "none",
                  }}
                >
                  {i}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-white mb-1">
              {rating && rating <= 3 ? "What could be better?" : "Any thoughts to share?"}
            </h2>
            <p className="text-gray-500 text-xs mb-4">Optional — helps us improve</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what happened..."
              rows={2}
              autoFocus
              className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500
                border border-white/10 bg-white/5 focus:border-yellow-400/50 focus:outline-none
                focus:ring-1 focus:ring-yellow-400/30 resize-none transition-all mb-4"
            />
            <div className="flex gap-3 w-full">
              <button
                onClick={handleSkipComment}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 rounded-full text-sm font-medium text-gray-400
                  border border-white/10 hover:border-white/20 transition-all disabled:opacity-50"
              >
                Skip
              </button>
              <button
                onClick={handleSubmitComment}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 rounded-full text-sm font-bold text-black
                  transition-all disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, rgb(250,204,21), rgb(255,160,0))",
                  boxShadow: "0 4px 16px rgba(250,204,21,0.3)",
                }}
              >
                {submitting ? "Sending..." : "Submit"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
