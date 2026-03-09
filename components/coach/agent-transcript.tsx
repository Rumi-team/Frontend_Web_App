"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { ReceivedMessage } from "@/lib/types/messages"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface AgentTranscriptProps {
  messages: ReceivedMessage[]
}

export function AgentTranscript({ messages }: AgentTranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const soundRef = useRef<HTMLAudioElement>(null)
  const [mascotReady, setMascotReady] = useState(false)
  const [mascotExiting, setMascotExiting] = useState(false)
  const didPlaySound = useRef(false)

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

  // When first agent message arrives, play ready sound + exit animation
  useEffect(() => {
    if (latestMessage && !didPlaySound.current) {
      didPlaySound.current = true
      // Play the Duolingo "correct!" sound
      try {
        soundRef.current?.play()
      } catch {
        // Autoplay may be blocked
      }
      setMascotReady(true)
      // Exit animation after sound
      const timer = setTimeout(() => setMascotExiting(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [latestMessage])

  // Loading state: Duolingo-style mascot animation
  if (!latestMessage) {
    return (
      <div className="flex h-full items-center justify-center">
        {/* Hidden audio element for ready sound */}
        <audio ref={soundRef} src="/sounds/agent-ready.mp3" preload="auto" />

        <div className={cn(
          "flex flex-col items-center gap-6 transition-all duration-500",
          mascotExiting && "opacity-0 scale-90"
        )}>
          {/* Mascot video animation */}
          <div className={cn(
            "relative transition-all duration-700 ease-out animate-in fade-in zoom-in-95",
            mascotReady ? "scale-110" : ""
          )}>
            <video
              ref={videoRef}
              className="w-40 h-40 rounded-full object-cover"
              src="/videos/mascot-intro.mp4"
              autoPlay
              loop
              muted
              playsInline
            />
            {/* Golden glow ring */}
            <div className={cn(
              "absolute inset-[-8px] rounded-full border-2 transition-all duration-500",
              mascotReady
                ? "border-yellow-400 shadow-[0_0_30px_rgba(255,210,50,0.6)]"
                : "border-yellow-400/30 animate-pulse"
            )} />
            {/* Sparkle particles when ready */}
            {mascotReady && (
              <>
                <div className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-300 rounded-full animate-ping" />
                <div className="absolute -bottom-1 -left-3 w-2 h-2 bg-yellow-200 rounded-full animate-ping delay-150" />
                <div className="absolute top-1/2 -right-4 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping delay-300" />
              </>
            )}
          </div>

          {/* Status text */}
          <p className={cn(
            "text-2xl font-semibold transition-all duration-300",
            mascotReady
              ? "text-yellow-400 scale-110"
              : "text-gray-400"
          )}>
            {mascotReady ? "Let's go!" : "Rumi is getting ready..."}
          </p>

          {/* Loading dots */}
          {!mascotReady && (
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto flex items-start px-10 py-8">
      {/* Ready sound (plays once on first agent message) */}
      <audio ref={soundRef} src="/sounds/agent-ready.mp3" preload="auto" />

      <div
        className="w-full rounded-3xl px-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
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
