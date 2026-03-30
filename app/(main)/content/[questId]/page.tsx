"use client"

import { useSearchParams, useParams } from "next/navigation"
import { JournalEntry } from "@/components/app/content/JournalEntry"

export default function QuestEntryPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const questId = params.questId as string
  const prompt = searchParams.get("prompt") || "Write freely about whatever is on your mind."
  const xp = parseInt(searchParams.get("xp") || "5", 10)

  return <JournalEntry questId={questId} prompt={prompt} xpReward={xp} />
}
