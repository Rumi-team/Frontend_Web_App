"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { createSupabaseBrowserClient } from "@/lib/supabase-auth-browser"
import { toast } from "sonner"
import { Star } from "lucide-react"

interface FeedbackModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const NPS_OPTIONS = Array.from({ length: 11 }, (_, i) => i) // 0-10

export function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const [rating, setRating] = useState(0)
  const [nps, setNps] = useState<number | null>(null)
  const [likedMost, setLikedMost] = useState("")
  const [improvements, setImprovements] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      const supabase = createSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Please sign in to send feedback.")
        setSubmitting(false)
        return
      }

      // Insert with fields matching Retention Dashboard's FeedbackRow schema
      await supabase.from("user_feedback").insert({
        provider_user_id: user.id,
        overall_rating: rating || null,
        nps_score: nps,
        nps_category: nps !== null ? (nps >= 9 ? "promoter" : nps >= 7 ? "passive" : "detractor") : null,
        liked_most: likedMost.trim() || null,
        improvement_suggestions: improvements.trim() || null,
        session_type: "app_feedback",
      })

      toast.success("Feedback sent! Thank you.")
      setRating(0)
      setNps(null)
      setLikedMost("")
      setImprovements("")
      onOpenChange(false)
    } catch {
      toast.error("Could not send feedback. Please try again.")
    }
    setSubmitting(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl bg-white dark:bg-gray-900 max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-gray-900 dark:text-gray-100">Send Feedback</SheetTitle>
        </SheetHeader>
        <div className="mt-4 flex flex-col gap-5">
          {/* Overall rating */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              How would you rate your experience?
            </p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform active:scale-90"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* NPS */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              How likely are you to recommend Rumi? (0-10)
            </p>
            <div className="flex gap-1 flex-wrap">
              {NPS_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => setNps(n)}
                  className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                    nps === n
                      ? "bg-amber-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* What you liked */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What did you like most?
            </p>
            <textarea
              value={likedMost}
              onChange={(e) => setLikedMost(e.target.value)}
              placeholder="The voice coaching felt really personal..."
              className="min-h-[60px] w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-gray-400 dark:focus:border-gray-500 resize-none"
            />
          </div>

          {/* Improvements */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What could be better?
            </p>
            <textarea
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              placeholder="I wish it would..."
              className="min-h-[60px] w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-gray-400 dark:focus:border-gray-500 resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full rounded-full bg-gray-800 dark:bg-gray-200 py-3 text-sm font-medium text-white dark:text-gray-900 disabled:opacity-40 transition-opacity"
          >
            {submitting ? "Sending..." : "Submit Feedback"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
