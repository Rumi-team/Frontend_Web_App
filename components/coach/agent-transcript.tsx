"use client"

import { useEffect, useRef } from "react"
import type { ReceivedMessage } from "@/lib/types/messages"
import { cn } from "@/lib/utils"

interface AgentTranscriptProps {
  messages: ReceivedMessage[]
}

export function AgentTranscript({ messages }: AgentTranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-gray-500 text-xl">Waiting for your coach...</p>
      </div>
    )
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 space-y-5">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={cn(
            "max-w-[85%] rounded-2xl px-6 py-4 text-xl leading-relaxed",
            msg.content.type === "agent"
              ? "self-start bg-gray-900 text-gray-100"
              : "self-end ml-auto bg-yellow-400/10 text-yellow-100"
          )}
        >
          {msg.styledSegments.map((seg, i) => (
            <span
              key={i}
              className={cn(seg.isHighlight && "font-semibold text-yellow-400")}
            >
              {seg.text}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}
