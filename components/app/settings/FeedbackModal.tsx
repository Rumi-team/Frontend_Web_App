"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { createSupabaseBrowserClient } from "@/lib/supabase-auth-browser"
import { toast } from "sonner"

interface FeedbackModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FeedbackModal({ open, onOpenChange }: FeedbackModalProps) {
  const [text, setText] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!text.trim() || submitting) return
    setSubmitting(true)
    try {
      const supabase = createSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from("user_feedback").insert({
          user_id: user.id,
          content: text.trim(),
          feedback_type: "general",
        })
      }
      toast.success("Feedback sent! Thank you.")
      setText("")
      onOpenChange(false)
    } catch {
      toast.error("Could not send feedback. Please try again.")
    }
    setSubmitting(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl bg-white dark:bg-gray-900">
        <SheetHeader>
          <SheetTitle className="text-gray-900 dark:text-gray-100">Send Feedback</SheetTitle>
        </SheetHeader>
        <div className="mt-4 flex flex-col gap-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Tell us anything..."
            className="min-h-[120px] w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-gray-400 dark:focus:border-gray-500 resize-none"
          />
          <button
            onClick={handleSubmit}
            disabled={!text.trim() || submitting}
            className="w-full rounded-full bg-gray-800 dark:bg-gray-200 py-3 text-sm font-medium text-white dark:text-gray-900 disabled:opacity-40 transition-opacity"
          >
            {submitting ? "Sending..." : "Submit"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
