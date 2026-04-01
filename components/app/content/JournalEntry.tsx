"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useUserStore } from "@/store/userStore"
import { createSupabaseBrowserClient } from "@/lib/supabase-auth-browser"
import { ArrowLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"

interface JournalEntryProps {
  questId: string
  prompt: string
  xpReward: number
}

export function JournalEntry({ questId, prompt, xpReward }: JournalEntryProps) {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const addXP = useUserStore((s) => s.addXP)
  const addWordCount = useUserStore((s) => s.addWordCount)

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length

  const handleSubmit = useCallback(async () => {
    if (!content.trim() || submitting) return
    setSubmitting(true)

    // Optimistic local save
    const savedContent = content
    localStorage.setItem(`rumi-journal-draft-${questId}`, savedContent)

    try {
      const supabase = createSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from("journal_entries").insert({
          user_id: user.id,
          quest_id: questId,
          prompt,
          content: savedContent,
          word_count: wordCount,
          xp_earned: xpReward,
        })
      }
      // Clear draft on success
      localStorage.removeItem(`rumi-journal-draft-${questId}`)
    } catch {
      toast.error("Could not save entry. It's saved locally and will sync later.")
    }

    // Award XP and word count regardless (optimistic)
    addXP(xpReward)
    addWordCount(wordCount)
    setSubmitting(false)
    router.back()
  }, [content, submitting, questId, prompt, wordCount, xpReward, addXP, addWordCount, router])

  return (
    <div className="flex flex-col min-h-dvh" style={{ background: "#FAF8F3" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <span className="text-xs text-gray-400">+{xpReward} XP</span>
      </div>

      {/* Prompt */}
      <div className="px-6 py-4">
        <p className="text-lg font-medium text-gray-800 leading-relaxed">{prompt}</p>
      </div>

      {/* Textarea */}
      <div className="flex-1 px-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing..."
          className="w-full h-full min-h-[200px] bg-transparent text-gray-700 text-base leading-relaxed outline-none resize-none placeholder:text-gray-300"
          autoFocus
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
        <span className="text-xs text-gray-400">{wordCount} words</span>
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || submitting}
          className="flex items-center gap-1 rounded-full bg-gray-800 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          {submitting ? "Saving..." : "Continue"}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
