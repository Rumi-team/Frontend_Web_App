"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { Room } from "livekit-client"
import type { ReceivedMessage } from "@/lib/types/messages"
import { sanitizeAgentText, parseStyledText } from "@/lib/utils/message-sanitizer"

interface UseChatMessagesReturn {
  messages: ReceivedMessage[]
  latestAgentMessage: ReceivedMessage | null
  sendMessage: (text: string) => Promise<void>
}

export function useChatMessages(room: Room | null): UseChatMessagesReturn {
  const [messages, setMessages] = useState<ReceivedMessage[]>([])
  const partialMessagesRef = useRef<Map<string, { content: string; timestamp: Date; streamId: string }>>(new Map())

  const updateOrAddMessage = useCallback((msg: ReceivedMessage) => {
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === msg.id)
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = msg
        return updated
      }
      return [...prev, msg]
    })
  }, [])

  useEffect(() => {
    if (!room) return

    const topic = "lk.transcription"

    room.registerTextStreamHandler(topic, async (reader, participantInfo) => {
      const segmentId =
        reader.info.attributes?.["lk.segment_id"] ?? reader.info.id
      const isFinal =
        reader.info.attributes?.["lk.transcription_final"] === "true"
      const streamId = reader.info.id
      const isAgent =
        participantInfo.identity !== room.localParticipant.identity
      const timestamp = new Date(reader.info.timestamp ?? Date.now())

      // For agent messages, iterate chunks; for user messages, read full replacements
      for await (const chunk of reader) {
        if (!chunk) continue

        const partials = partialMessagesRef.current
        const existing = partials.get(segmentId)

        let updatedContent: string
        if (existing) {
          if (existing.streamId === streamId) {
            // Same stream — append (agent chunked messages)
            updatedContent = existing.content + chunk
          } else {
            // Different stream for same segment — replace (user STT updates)
            updatedContent = chunk
          }
          partials.set(segmentId, {
            content: updatedContent,
            timestamp: existing.timestamp,
            streamId,
          })
        } else {
          updatedContent = chunk
          partials.set(segmentId, {
            content: updatedContent,
            timestamp,
            streamId,
          })
        }

        const displayText = isAgent
          ? sanitizeAgentText(updatedContent)
          : updatedContent

        if (!displayText) continue

        const msg: ReceivedMessage = {
          id: segmentId,
          timestamp: existing?.timestamp ?? timestamp,
          content: {
            type: isAgent ? "agent" : "user",
            text: displayText,
          },
          styledSegments: parseStyledText(displayText),
        }

        updateOrAddMessage(msg)
      }

      // Cleanup partial on finalization
      if (isFinal) {
        partialMessagesRef.current.delete(segmentId)
      }
    })

    return () => {
      room.unregisterTextStreamHandler(topic)
    }
  }, [room, updateOrAddMessage])

  const sendMessage = useCallback(
    async (text: string) => {
      if (!room || !text.trim()) return

      // Send via LiveKit text stream on the chat topic
      await room.localParticipant.sendText(text, { topic: "lk.chat" })

      // Create local loopback message for immediate display
      const localMsg: ReceivedMessage = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        content: { type: "user", text },
        styledSegments: [{ text, isHighlight: false }],
      }
      setMessages((prev) => [...prev, localMsg])
    },
    [room]
  )

  const latestAgentMessage =
    [...messages].reverse().find((m) => m.content.type === "agent") ?? null

  return { messages, latestAgentMessage, sendMessage }
}
