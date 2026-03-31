"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { createSupabaseBrowserClient } from "@/lib/supabase-auth-browser"
import { toast } from "sonner"
import { Users, ShieldCheck, CalendarDays, Sparkles, Check } from "lucide-react"

interface HumanCoachModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HumanCoachModal({ open, onOpenChange }: HumanCoachModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const [joined, setJoined] = useState(false)

  const handleJoin = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      const supabase = createSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) {
        toast.error("Please sign in to join the waitlist.")
        setSubmitting(false)
        return
      }

      // Check for duplicates
      const { data: existing } = await supabase
        .from("website_waitlist")
        .select("email")
        .eq("email", user.email)
        .eq("source", "human_coach")
        .maybeSingle()

      if (existing) {
        setJoined(true)
        toast.success("You're already on the list!")
        setSubmitting(false)
        return
      }

      // Insert into waitlist
      await supabase.from("website_waitlist").insert({
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name || user.email.split("@")[0],
        source: "human_coach",
      })

      // Send notification email via webhook
      try {
        const webhookUrl = "/api/coach-waitlist-notify"
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: user.user_metadata?.full_name || user.user_metadata?.name || user.email.split("@")[0],
            email: user.email,
          }),
        })
      } catch {
        // Non-blocking — waitlist entry is already saved
      }

      setJoined(true)
      toast.success("You're on the waitlist!")
    } catch {
      toast.error("Something went wrong. Please try again.")
    }
    setSubmitting(false)
  }

  return (
    <Sheet open={open} onOpenChange={(val) => { onOpenChange(val); if (!val) setJoined(false) }}>
      <SheetContent side="bottom" className="rounded-t-3xl bg-white">
        <SheetHeader>
          <div className="flex items-center gap-3 mt-2">
            <Users className="h-8 w-8 text-gray-600" />
            <SheetTitle className="text-xl">Rumi x Human Life Coach</SheetTitle>
          </div>
        </SheetHeader>

        {joined ? (
          <div className="mt-8 mb-4 flex flex-col items-center gap-3 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-lg font-semibold text-gray-900">You're on the list!</p>
            <p className="text-sm text-gray-500">We'll reach out via email as soon as spots open.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            <div className="flex gap-3">
              <ShieldCheck className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">
                Top-qualified life coaches who go through Rumi's careful vetting process.
              </p>
            </div>
            <div className="flex gap-3">
              <CalendarDays className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">
                Monthly live sessions with a human coach who is fully integrated with your Rumi AI coaching history.
              </p>
            </div>
            <div className="flex gap-3">
              <Sparkles className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">
                $149/month — less than a single session with most life coaches ($150+/hr).
              </p>
            </div>

            <p className="text-sm text-gray-500 pt-2">
              Interested? Sign up and we'll be in touch via email.
            </p>

            <button
              onClick={handleJoin}
              disabled={submitting}
              className="w-full rounded-full bg-amber-500 py-3.5 text-sm font-semibold text-white hover:bg-amber-400 disabled:opacity-50 transition-all"
            >
              {submitting ? "Joining..." : "Join the Waitlist"}
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
