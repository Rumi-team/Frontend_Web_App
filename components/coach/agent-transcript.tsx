"use client"

import { useEffect, useRef } from "react"
import type { ReceivedMessage } from "@/lib/types/messages"
import { cn } from "@/lib/utils"

interface AgentTranscriptProps {
  messages: ReceivedMessage[]
}

export function AgentTranscript({ messages }: AgentTranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Only show agent/coach messages (matching iOS behavior)
  const agentMessages = messages.filter((msg) => msg.content.type === "agent")

  // Show only the latest agent message (live caption style)
  const latestMessage = agentMessages.length > 0
    ? agentMessages[agentMessages.length - 1]
    : null

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [latestMessage])

  if (!latestMessage) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-400 text-3xl font-medium">Waiting for your coach...</p>
      </div>
    )
  }

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto flex items-start px-10 py-8">
      <div
        className="w-full rounded-3xl px-8 py-6"
        style={{
          backgroundColor: "rgba(255, 230, 133, 0.95)",
          boxShadow: "0 6px 20px rgba(0, 0, 0, 0.12)",
        }}
      >
        <p className="text-3xl leading-relaxed">
          {latestMessage.styledSegments.map((seg, i) => (
            <span
              key={i}
              className={cn(
                seg.isHighlight ? "font-semibold" : "font-normal"
              )}
              style={{
                color: seg.isHighlight
                  ? "rgb(180, 130, 10)"
                  : "rgb(50, 34, 8)",
              }}
            >
              {seg.text}
            </span>
          ))}
        </p>
      </div>
    </div>
  )
}
