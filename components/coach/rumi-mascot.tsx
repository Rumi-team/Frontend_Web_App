"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"

export type MascotMood =
  | "idle"
  | "listening"
  | "celebrating"
  | "impressed"
  | "thinking"
  | "cheering"

interface RumiMascotProps {
  mood?: MascotMood
  audioTrack?: MediaStreamTrack | null
  size?: number
  className?: string
}

// ── Audio activity hook: detect when agent is speaking ──
function useAudioActivity(audioTrack: MediaStreamTrack | null | undefined) {
  const [activity, setActivity] = useState(0)
  const prevRef = useRef(0)

  useEffect(() => {
    if (!audioTrack) {
      setActivity(0)
      prevRef.current = 0
      return
    }

    let animId: number
    let active = true

    const audioCtx = new AudioContext()
    const source = audioCtx.createMediaStreamSource(new MediaStream([audioTrack]))
    const analyser = audioCtx.createAnalyser()
    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.4
    source.connect(analyser)

    const data = new Uint8Array(analyser.frequencyBinCount)

    function tick() {
      if (!active) return
      analyser.getByteTimeDomainData(data)
      let sum = 0
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128
        sum += v * v
      }
      const rms = Math.sqrt(sum / data.length)
      const target = Math.min(rms * 6, 1)
      const prev = prevRef.current
      const next =
        target > prev ? prev * 0.15 + target * 0.85 : prev * 0.55 + target * 0.45
      prevRef.current = next
      setActivity(next)
      animId = requestAnimationFrame(tick)
    }

    animId = requestAnimationFrame(tick)

    return () => {
      active = false
      cancelAnimationFrame(animId)
      source.disconnect()
      audioCtx.close()
    }
  }, [audioTrack])

  return activity
}

// ── Main Component ──
export function RumiMascot({
  mood = "idle",
  audioTrack = null,
  size = 200,
  className = "",
}: RumiMascotProps) {
  const activity = useAudioActivity(audioTrack)

  // Gentle idle breathing
  const [breathOffset, setBreathOffset] = useState(0)
  const breathRef = useRef<number>(0)
  const startRef = useRef(Date.now())

  useEffect(() => {
    function animate() {
      const elapsed = (Date.now() - startRef.current) / 1000
      setBreathOffset(Math.sin(elapsed * 1.2) * 1.5)
      breathRef.current = requestAnimationFrame(animate)
    }
    breathRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(breathRef.current)
  }, [])

  const isCelebrating = mood === "celebrating" || mood === "cheering"
  const isSpeaking = activity > 0.05

  // Dynamic glow intensity based on audio activity
  const glowIntensity = isSpeaking ? 0.3 + activity * 0.7 : 0
  const glowScale = 1 + activity * 0.04

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Speaking glow ring behind mascot */}
      {isSpeaking && (
        <div
          className="absolute inset-[-12%] rounded-full transition-opacity duration-150"
          style={{
            background: `radial-gradient(circle, rgba(255,193,7,${glowIntensity * 0.4}) 0%, rgba(255,193,7,0) 70%)`,
            opacity: glowIntensity,
          }}
        />
      )}

      {/* Mascot image with breathing animation */}
      <div
        className="relative w-full h-full"
        style={{
          transform: `translateY(${breathOffset}px) scale(${glowScale})`,
          transition: "transform 0.1s ease-out",
        }}
      >
        <Image
          src="/rumi_mascot.png"
          alt="Rumi mascot"
          width={size}
          height={size}
          className="object-contain drop-shadow-lg"
          priority
        />
      </div>

      {/* Celebrating sparkles */}
      {isCelebrating && (
        <>
          {[0, 60, 120, 180, 240, 300].map((angle, i) => {
            const rad = (angle * Math.PI) / 180
            const r = size * 0.42
            const cx = size / 2 + r * Math.cos(rad)
            const cy = size / 2 + r * Math.sin(rad)
            return (
              <div
                key={i}
                className="absolute w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping"
                style={{
                  left: cx - 5,
                  top: cy - 5,
                  animationDelay: `${i * 0.12}s`,
                }}
              />
            )
          })}
        </>
      )}
    </div>
  )
}
