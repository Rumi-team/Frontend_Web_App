"use client"

import { Mic, MicOff, MessageSquare, PhoneOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface ControlBarProps {
  isMicrophoneEnabled: boolean
  textMode: 0 | 1 | 2
  onToggleMic: () => void
  onCycleTextMode: () => void
  onEndSession: () => void
}

export function ControlBar({
  isMicrophoneEnabled,
  textMode,
  onToggleMic,
  onCycleTextMode,
  onEndSession,
}: ControlBarProps) {
  const textActive = textMode !== 0
  return (
    <div className="flex items-center justify-center gap-8 px-6 py-5">
      {/* ── Text Mode Button (cycles: off → transcript → input → off) ── */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={onCycleTextMode}
          className={cn(
            "relative h-16 w-16 rounded-full transition-all duration-300",
            "flex items-center justify-center",
            "border-2",
            textActive
              ? "border-yellow-400/60 text-yellow-300"
              : "border-white/15 text-white/70 hover:border-white/30 hover:text-white"
          )}
          style={{
            background: textActive
              ? "linear-gradient(145deg, rgba(250,204,21,0.25), rgba(255,152,0,0.15))"
              : "linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
            boxShadow: textActive
              ? "0 0 20px rgba(250,204,21,0.2), inset 0 1px 0 rgba(255,255,255,0.1)"
              : "inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <MessageSquare className="h-7 w-7" />
        </button>
        <span className={cn(
          "text-sm font-medium tracking-wide",
          textActive ? "text-yellow-400/80" : "text-white/40"
        )}>
          Transcript
        </span>
      </div>

      {/* ── Microphone Button (Primary — largest) ── */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={onToggleMic}
          className={cn(
            "relative h-[88px] w-[88px] rounded-full transition-all duration-300",
            "flex items-center justify-center",
            "border-2",
            isMicrophoneEnabled
              ? "border-yellow-400/50 text-white animate-mic-glow"
              : "border-red-500/50 text-red-300"
          )}
          style={{
            background: isMicrophoneEnabled
              ? "linear-gradient(145deg, rgba(250,204,21,0.2), rgba(255,109,0,0.15))"
              : "linear-gradient(145deg, rgba(239,68,68,0.2), rgba(185,28,28,0.15))",
            boxShadow: isMicrophoneEnabled
              ? "0 0 32px rgba(250,204,21,0.25), 0 0 64px rgba(250,204,21,0.1), inset 0 1px 0 rgba(255,255,255,0.1)"
              : "0 0 20px rgba(239,68,68,0.2), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          {/* Pulsing ring when mic is active */}
          {isMicrophoneEnabled && (
            <span className="absolute inset-0 rounded-full animate-mic-pulse border-2 border-yellow-400/30" />
          )}
          {isMicrophoneEnabled ? (
            <Mic className="h-10 w-10" />
          ) : (
            <MicOff className="h-10 w-10" />
          )}
        </button>
        <span className={cn(
          "text-sm font-medium tracking-wide",
          isMicrophoneEnabled ? "text-yellow-400/80" : "text-red-400/70"
        )}>
          {isMicrophoneEnabled ? "Listening" : "Muted"}
        </span>
      </div>

      {/* ── End Session Button ── */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={onEndSession}
          className={cn(
            "relative h-16 w-16 rounded-full transition-all duration-300",
            "flex items-center justify-center",
            "border-2 border-red-500/40 text-red-300",
            "hover:border-red-400/60 hover:text-red-200"
          )}
          style={{
            background: "linear-gradient(145deg, rgba(239,68,68,0.2), rgba(153,27,27,0.25))",
            boxShadow: "0 0 16px rgba(239,68,68,0.15), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <PhoneOff className="h-7 w-7" />
        </button>
        <span className="text-sm font-medium tracking-wide text-red-400/60">
          End
        </span>
      </div>
    </div>
  )
}
