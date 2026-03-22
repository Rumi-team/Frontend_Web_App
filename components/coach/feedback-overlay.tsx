"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "@/components/auth-provider"
import { createSupabaseBrowserClient } from "@/lib/supabase-auth-browser"
import { Paperclip, Loader2, CheckCircle2 } from "lucide-react"

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
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "done" | "error">("idle")
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      const { error } = await supabase.from("user_feedback").insert({
        session_id: sessionId,
        provider_user_id: providerUserId,
        overall_rating: finalRating,
        nps_score: finalNps,
        nps_category: finalNps !== null ? npsCategory(finalNps) : null,
        improvement_suggestions: finalComment.trim() || null,
        had_bugs: false,
        had_ui_issues: false,
      })
      if (error) console.error("Failed to save feedback:", error)
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
    // Always show comment step — user can Skip if they have nothing to add.
    // This ensures the PDF/doc upload option is always reachable.
    setTimeout(() => setStep("comment"), 300)
  }, [])

  const handleSubmitComment = useCallback(() => {
    if (rating) submit(rating, npsScore, comment)
  }, [rating, npsScore, comment, submit])

  const handleSkipComment = useCallback(() => {
    if (rating) submit(rating, npsScore, "")
  }, [rating, npsScore, submit])

  const handleFileUpload = useCallback(async (file: File) => {
    setUploadState("uploading")
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/feedback/process-doc", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Upload failed")
      setComment(data.text ?? "")
      setUploadState("done")
    } catch (err) {
      console.error("Doc upload failed:", err)
      setUploadState("error")
      setTimeout(() => setUploadState("idle"), 3000)
    }
  }, [])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto py-4 sm:py-0 transition-opacity duration-400
        ${visible ? "opacity-100" : "opacity-0"}`}
      style={{ background: "rgb(9, 11, 17)" }}
    >
      <div
        className={`flex flex-col items-center w-full max-w-2xl mx-4 sm:mx-0 px-5 sm:px-12 py-8 sm:py-16 text-center rounded-3xl transform transition-all duration-500
          ${visible ? "translate-y-0 scale-100" : "translate-y-8 scale-95"}`}
        style={{ background: "rgb(15, 17, 26)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Mascot */}
        <img
          src="/rumi_mascot.png"
          alt="Rumi"
          className="w-24 h-24 sm:w-40 sm:h-40 rounded-full object-cover mb-4 sm:mb-8"
        />

        {submitted ? (
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-yellow-400">Thank you!</h2>
            <p className="text-gray-400 text-base sm:text-lg">Your feedback helps Rumi grow</p>
          </div>
        ) : step === "rate" ? (
          <>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-2 sm:mb-3">How was your session?</h2>
            <p className="text-gray-500 text-sm sm:text-base mb-5 sm:mb-8">Tap to rate</p>
            <div className="flex gap-2 sm:gap-5 mb-4 sm:mb-6 flex-wrap justify-center">
              {RATINGS.map((r, i) => (
                <button
                  key={r.value}
                  onClick={() => handleRating(r.value)}
                  disabled={submitting}
                  className={`flex flex-col items-center gap-1 sm:gap-2 px-3 py-3 sm:px-6 sm:py-5 rounded-2xl
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
                  <span className="text-4xl sm:text-5xl">{r.emoji}</span>
                  <span className={`text-xs sm:text-sm font-medium ${
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
            <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-2 sm:mb-3">
              Would you tell a friend about Rumi?
            </h2>
            <p className="text-gray-500 text-sm sm:text-base mb-5 sm:mb-8">0 = not likely &middot; 10 = absolutely</p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-4">
              {Array.from({ length: 11 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handleNps(i)}
                  disabled={submitting}
                  className={`w-11 h-11 sm:w-16 sm:h-16 rounded-full text-base sm:text-xl font-bold
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
            <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-2 sm:mb-3">
              {rating && rating <= 3 ? "What could be better?" : "Any thoughts to share?"}
            </h2>
            <p className="text-gray-500 text-sm sm:text-base mb-5 sm:mb-8">Optional — helps us improve</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what happened..."
              rows={3}
              autoFocus
              className="w-full rounded-2xl px-4 sm:px-6 py-4 sm:py-5 text-base sm:text-lg text-white placeholder-gray-500
                border border-white/10 bg-white/5 focus:border-yellow-400/50 focus:outline-none
                focus:ring-1 focus:ring-yellow-400/30 resize-none transition-all mb-4 sm:mb-6"
            />

            {/* Doc upload row */}
            <div className="w-full mb-5 sm:mb-8">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file)
                  e.target.value = ""
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadState === "uploading" || submitting}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200
                  transition-colors disabled:opacity-40"
              >
                {uploadState === "uploading" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : uploadState === "done" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                ) : (
                  <Paperclip className="h-5 w-5" />
                )}
                {uploadState === "uploading"
                  ? "Processing document…"
                  : uploadState === "done"
                    ? "Document added"
                    : uploadState === "error"
                      ? "Upload failed — try again"
                      : "Attach PDF or Word doc"}
              </button>
            </div>

            <div className="flex gap-4 w-full">
              <button
                onClick={handleSkipComment}
                disabled={submitting}
                className="flex-1 px-5 sm:px-8 py-4 sm:py-5 rounded-full text-base sm:text-lg font-medium text-gray-400
                  border border-white/10 hover:border-white/20 transition-all disabled:opacity-50"
              >
                Skip
              </button>
              <button
                onClick={handleSubmitComment}
                disabled={submitting}
                className="flex-1 px-5 sm:px-8 py-4 sm:py-5 rounded-full text-base sm:text-lg font-bold text-black
                  transition-all disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, rgb(250,204,21), rgb(255,160,0))",
                  boxShadow: "0 4px 16px rgba(250,204,21,0.3)",
                }}
              >
                {submitting ? "Sending…" : "Submit"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
