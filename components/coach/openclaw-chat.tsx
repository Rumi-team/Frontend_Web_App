"use client"

import { useEffect, useRef, useState } from "react"
import { Send, Loader2, Bot, User, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface OpenClawChatProps {
  className?: string
}

export function OpenClawChat({ className }: OpenClawChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm Rumi — your text coaching companion. I have access to your full coaching history and can continue our work between voice sessions. What's on your mind?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [unavailable, setUnavailable] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/coaching/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, session_id: sessionId }),
      })

      const data = await res.json()

      if (res.status === 503) {
        setUnavailable(true)
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "Text coaching isn't available yet — it needs the backend API to be deployed. Your voice sessions with Rumi are fully available at /rumi.",
            timestamp: new Date(),
          },
        ])
        return
      }

      if (!res.ok) {
        throw new Error(data.error ?? "Coaching service error")
      }

      if (data.session_id) setSessionId(data.session_id)

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        },
      ])
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Sorry, something went wrong: ${msg}`,
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
      textareaRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-3",
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            {/* Avatar */}
            <div
              className={cn(
                "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center",
                msg.role === "assistant"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-white/10 text-gray-400"
              )}
            >
              {msg.role === "assistant" ? (
                <Bot className="h-4 w-4" />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={cn(
                "max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "assistant"
                  ? "bg-white/[0.06] text-gray-200 rounded-tl-sm"
                  : "bg-yellow-500/20 text-yellow-100 rounded-tr-sm"
              )}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <p
                className={cn(
                  "text-xs mt-1.5",
                  msg.role === "assistant" ? "text-gray-600" : "text-yellow-500/50"
                )}
              >
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4 text-yellow-400" />
            </div>
            <div className="bg-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1.5 items-center h-5">
                <span className="h-2 w-2 rounded-full bg-yellow-400/60 animate-bounce [animation-delay:0ms]" />
                <span className="h-2 w-2 rounded-full bg-yellow-400/60 animate-bounce [animation-delay:150ms]" />
                <span className="h-2 w-2 rounded-full bg-yellow-400/60 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/[0.06] p-4">
        {unavailable ? (
          <div className="flex items-center gap-2 text-sm text-gray-500 text-center justify-center py-2">
            <MessageSquare className="h-4 w-4" />
            Text coaching requires backend deployment — voice sessions at{" "}
            <a href="/rumi" className="text-yellow-400 underline hover:text-yellow-300">
              /rumi
            </a>{" "}
            are fully available.
          </div>
        ) : (
          <div className="flex gap-3 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Rumi... (Enter to send, Shift+Enter for new line)"
              rows={1}
              disabled={loading}
              className="flex-1 resize-none rounded-xl bg-white/[0.06] border border-white/[0.08] text-white placeholder:text-gray-600 px-4 py-3 text-sm focus:outline-none focus:border-yellow-500/40 focus:ring-1 focus:ring-yellow-500/20 transition-all disabled:opacity-50 max-h-32 overflow-y-auto"
              style={{ minHeight: "48px" }}
              onInput={(e) => {
                const el = e.currentTarget
                el.style.height = "48px"
                el.style.height = `${Math.min(el.scrollHeight, 128)}px`
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="h-12 w-12 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black flex items-center justify-center flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
