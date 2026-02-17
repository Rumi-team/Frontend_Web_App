"use client"

import { Button } from "@/components/ui/button"
import { Mic, MicOff, MessageSquare, PhoneOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface ControlBarProps {
  isMicrophoneEnabled: boolean
  isTextMode: boolean
  onToggleMic: () => void
  onToggleTextMode: () => void
  onEndSession: () => void
}

export function ControlBar({
  isMicrophoneEnabled,
  isTextMode,
  onToggleMic,
  onToggleTextMode,
  onEndSession,
}: ControlBarProps) {
  return (
    <div className="flex items-center justify-center gap-6 border-t border-gray-800 bg-black/80 backdrop-blur-sm px-6 py-5">
      <Button
        variant="outline"
        size="icon"
        onClick={onToggleMic}
        className={cn(
          "h-20 w-20 rounded-full border-gray-700",
          isMicrophoneEnabled
            ? "bg-gray-800 text-white hover:bg-gray-700"
            : "bg-red-900/50 text-red-400 border-red-700 hover:bg-red-900/70"
        )}
      >
        {isMicrophoneEnabled ? (
          <Mic className="h-14 w-14" />
        ) : (
          <MicOff className="h-14 w-14" />
        )}
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={onToggleTextMode}
        className={cn(
          "h-20 w-20 rounded-full border-gray-700",
          isTextMode
            ? "bg-yellow-400/20 text-yellow-400 border-yellow-600"
            : "bg-gray-800 text-white hover:bg-gray-700"
        )}
      >
        <MessageSquare className="h-14 w-14" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={onEndSession}
        className="h-20 w-20 rounded-full border-red-700 bg-red-900/50 text-red-400 hover:bg-red-900/70"
      >
        <PhoneOff className="h-14 w-14" />
      </Button>
    </div>
  )
}
