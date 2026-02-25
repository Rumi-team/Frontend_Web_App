"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"

interface TextInputProps {
  onSend: (text: string) => Promise<void>
  disabled?: boolean
}

export function TextInput({ onSend, disabled }: TextInputProps) {
  const [text, setText] = useState("")
  const [isSending, setIsSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = useCallback(async () => {
    const trimmed = text.trim()
    if (!trimmed || isSending) return

    setIsSending(true)
    try {
      await onSend(trimmed)
      setText("")
      textareaRef.current?.focus()
    } finally {
      setIsSending(false)
    }
  }, [text, isSending, onSend])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-end gap-3 border-t border-gray-800 bg-black/80 backdrop-blur-sm px-6 py-4">
      <Textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        disabled={disabled || isSending}
        className="min-h-[52px] max-h-40 resize-none border-gray-700 bg-gray-900 text-lg text-white placeholder:text-gray-500 rounded-xl px-4 py-3"
        rows={1}
      />
      <Button
        onClick={handleSend}
        disabled={!text.trim() || disabled || isSending}
        size="icon"
        className="h-13 w-13 shrink-0 bg-yellow-400 text-black hover:bg-yellow-300 rounded-xl"
      >
        <Send className="h-6 w-6" />
      </Button>
    </div>
  )
}
