"use client"

import { OpenClawChat } from "@/components/coach/openclaw-chat"

export default function TextPage() {
  return (
    <div className="flex flex-col h-full min-h-[calc(100dvh-5rem)]" style={{ background: "#FAF8F3" }}>
      <OpenClawChat />
    </div>
  )
}
