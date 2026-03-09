"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"
import { createSupabaseBrowserClient } from "@/lib/supabase-auth-browser"

interface FeedbackOverlayProps {
  sessionId: string
  onComplete: () => void
}

const RATINGS = [
  { value: 1, emoji: "😞", label: "Poor" },
  { value: 2, emoji: "😕", label: "Meh" },
  { value: 3, emoji: "😐", label: "OK" },
  { value: 4, emoji: "😊", label: "Good" },
  { value: 5, emoji: "🤩", label: "Great" },
]

export function FeedbackOverlay({ sessionId, onComplete }: FeedbackOverlayProps) {
  const { providerUserId } = useAuth()
  const [visible, setVisible] = useState(false)
  const [rating, setRating] = useState<number | null>(null)
  const [comment, setComment] = useState("")
  const [step, setStep] = useState<"rate" | "comment">("rate")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const submit = useCallback(async (finalRating: number, finalComment: string) => {
    setSubmitting(true)
    try {
      const supabase = createSupabaseBrowserClient()
      await supabase.from("user_feedback").insert({
        session_id: sessionId,
        provider_user_id: providerUserId,
        overall_rating: finalRating,
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
    // For low ratings, ask for comment. For high ratings, auto-submit.
    if (value >= 4) {
      submit(value, "")
    } else {
      setTimeout(() => setStep("comment"), 300)
    }
  }, [submit])

  const handleSubmitComment = useCallback(() => {
    if (rating) submit(rating, comment)
  }, [rating, comment, submit])

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
        ) : (
          <>
            <h2 className="text-lg font-semibold text-white mb-1">What could be better?</h2>
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
            <button
              onClick={handleSubmitComment}
              disabled={submitting}
              className="w-full px-4 py-2.5 rounded-full text-sm font-bold text-black
                transition-all disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, rgb(250,204,21), rgb(255,160,0))",
                boxShadow: "0 4px 16px rgba(250,204,21,0.3)",
              }}
            >
              {submitting ? "Sending..." : "Submit"}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
