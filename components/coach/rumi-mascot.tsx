"use client"

import { useState, useEffect, useRef, useCallback } from "react"

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

// ── Lip-sync hook: analyse remote audio → mouth open amount 0-1 ──
function useLipSync(audioTrack: MediaStreamTrack | null | undefined) {
  const [mouthOpen, setMouthOpen] = useState(0)
  const prevRef = useRef(0)

  useEffect(() => {
    if (!audioTrack) {
      setMouthOpen(0)
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
      // Fast open, slower close for natural lip movement
      const prev = prevRef.current
      const next =
        target > prev ? prev * 0.15 + target * 0.85 : prev * 0.55 + target * 0.45
      prevRef.current = next
      setMouthOpen(next)
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

  return mouthOpen
}

// ── Main Component ──
export function RumiMascot({
  mood = "idle",
  audioTrack = null,
  size = 200,
  className = "",
}: RumiMascotProps) {
  const mouthOpen = useLipSync(audioTrack)

  // Blink timer
  const [blinking, setBlinking] = useState(false)
  const blinkTimer = useRef<ReturnType<typeof setTimeout>>()

  const scheduleBlink = useCallback(() => {
    blinkTimer.current = setTimeout(
      () => {
        setBlinking(true)
        setTimeout(() => {
          setBlinking(false)
          scheduleBlink()
        }, 140)
      },
      2200 + Math.random() * 3500
    )
  }, [])

  useEffect(() => {
    scheduleBlink()
    return () => {
      if (blinkTimer.current) clearTimeout(blinkTimer.current)
    }
  }, [scheduleBlink])

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
  const eyesClosed = isCelebrating || blinking

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ transform: `translateY(${breathOffset}px)` }}
      >
        <defs>
          {/* Skin gradient */}
          <radialGradient id="rm-skin" cx="0.45" cy="0.35" r="0.6">
            <stop offset="0%" stopColor="#FFEDDA" />
            <stop offset="100%" stopColor="#FFDAB9" />
          </radialGradient>
          {/* Hair gradient */}
          <linearGradient id="rm-hair" x1="0.1" y1="0" x2="0.9" y2="1">
            <stop offset="0%" stopColor="#FFE082" />
            <stop offset="40%" stopColor="#FFD54F" />
            <stop offset="100%" stopColor="#FFC107" />
          </linearGradient>
          {/* Hair highlight */}
          <linearGradient id="rm-hair-shine" x1="0.3" y1="0" x2="0.7" y2="0.5">
            <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          {/* Eye iris */}
          <radialGradient id="rm-iris" cx="0.45" cy="0.4" r="0.55">
            <stop offset="0%" stopColor="#64B5F6" />
            <stop offset="60%" stopColor="#1E88E5" />
            <stop offset="100%" stopColor="#0D47A1" />
          </radialGradient>
          {/* Clothing */}
          <linearGradient id="rm-cloth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFB300" />
            <stop offset="100%" stopColor="#F57F17" />
          </linearGradient>
          {/* Audio glow when speaking */}
          <radialGradient id="rm-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="rgba(255,193,7,0.08)" />
            <stop offset="100%" stopColor="rgba(255,193,7,0)" />
          </radialGradient>
        </defs>

        {/* Speaking glow behind character */}
        {mouthOpen > 0.05 && (
          <circle
            cx="100"
            cy="100"
            r={90 + mouthOpen * 10}
            fill="url(#rm-glow)"
            opacity={0.5 + mouthOpen * 0.5}
          />
        )}

        {/* ── Back hair (behind everything) ── */}
        <g className="animate-hair-sway">
          {/* Left back hair */}
          <path
            d="M48 58 C42 90, 35 135, 42 185 L60 190 C56 145, 52 100, 56 65 Z"
            fill="url(#rm-hair)"
            opacity="0.85"
          />
          {/* Right back hair */}
          <path
            d="M152 58 C158 90, 165 135, 158 185 L140 190 C144 145, 148 100, 144 65 Z"
            fill="url(#rm-hair)"
            opacity="0.85"
          />
          {/* Center back hair */}
          <path
            d="M62 50 C70 30, 130 30, 138 50 L142 60 C142 70, 130 85, 120 90
               L100 95 L80 90 C70 85, 58 70, 58 60 Z"
            fill="url(#rm-hair)"
          />
        </g>

        {/* ── Shoulders / Clothing ── */}
        <path
          d="M50 162 C50 148, 65 140, 100 138 C135 140, 150 148, 150 162 L152 200 L48 200 Z"
          fill="url(#rm-cloth)"
        />
        {/* Collar / V-neckline */}
        <path
          d="M78 142 L100 160 L122 142"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.5"
          fill="none"
        />
        {/* Collar inner fabric */}
        <path
          d="M82 143 L100 156 L118 143"
          stroke="rgba(200,150,0,0.4)"
          strokeWidth="1"
          fill="none"
        />

        {/* ── Neck ── */}
        <path
          d="M88 128 C88 135, 88 140, 90 142 L110 142 C112 140, 112 135, 112 128"
          fill="url(#rm-skin)"
        />

        {/* ── Face ── */}
        <path
          d="M62 82 C62 52, 78 38, 100 38 C122 38, 138 52, 138 82
             L138 98 C138 120, 124 132, 100 135 C76 132, 62 120, 62 98 Z"
          fill="url(#rm-skin)"
        />

        {/* Ears */}
        <ellipse cx="61" cy="90" rx="5" ry="7" fill="#FFDAB9" />
        <ellipse cx="139" cy="90" rx="5" ry="7" fill="#FFDAB9" />

        {/* ── Side hair (over ears, frames face) ── */}
        <g className="animate-hair-sway-left">
          <path
            d="M58 52 C52 60, 46 80, 44 105 C42 125, 45 150, 50 170
               L58 172 C56 148, 54 120, 55 100 C56 80, 58 65, 62 55 Z"
            fill="url(#rm-hair)"
          />
          {/* Strand detail */}
          <path
            d="M55 70 C52 90, 50 115, 52 145"
            stroke="rgba(200,160,40,0.3)"
            strokeWidth="0.8"
            fill="none"
          />
        </g>
        <g className="animate-hair-sway-right">
          <path
            d="M142 52 C148 60, 154 80, 156 105 C158 125, 155 150, 150 170
               L142 172 C144 148, 146 120, 145 100 C144 80, 142 65, 138 55 Z"
            fill="url(#rm-hair)"
          />
          <path
            d="M145 70 C148 90, 150 115, 148 145"
            stroke="rgba(200,160,40,0.3)"
            strokeWidth="0.8"
            fill="none"
          />
        </g>

        {/* ── Front bangs ── */}
        <path
          d="M62 68 C62 52, 70 38, 78 35 C85 32, 92 30, 100 30
             C108 30, 115 32, 122 35 C130 38, 138 52, 138 68
             L134 62 C130 52, 122 44, 112 42 L108 56 L100 44
             L92 56 L88 42 C78 44, 70 52, 66 62 Z"
          fill="url(#rm-hair)"
        />
        {/* Hair shine streak */}
        <path
          d="M80 38 C85 32, 100 30, 100 30 L98 44 L92 56 L88 42 C82 44, 78 48, 80 38 Z"
          fill="url(#rm-hair-shine)"
        />

        {/* ── Cheek blush ── */}
        <ellipse cx="72" cy="106" rx="10" ry="5" fill="rgba(255,160,160,0.25)" />
        <ellipse cx="128" cy="106" rx="10" ry="5" fill="rgba(255,160,160,0.25)" />

        {/* ── Eyes ── */}
        <g transform={`translate(0, ${mood === "thinking" ? -2 : 0})`}>
          {/* Left eye */}
          <g>
            {eyesClosed ? (
              /* Happy closed eye or blink */
              <path
                d={
                  isCelebrating
                    ? "M72 88 Q82 82, 92 88" /* upward arc — happy */
                    : "M72 88 Q82 92, 92 88" /* downward arc — blink */
                }
                stroke="#2A1B0A"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              <>
                {/* Sclera */}
                <ellipse
                  cx="82"
                  cy="88"
                  rx={mood === "impressed" ? 12 : 10}
                  ry={mood === "impressed" ? 13 : 11}
                  fill="white"
                />
                {/* Iris */}
                <circle cx="82" cy="89" r="7" fill="url(#rm-iris)" />
                {/* Pupil */}
                <circle cx="82" cy="89" r="3.5" fill="#0A1929" />
                {/* Main highlight */}
                <circle cx="86" cy="85" r="2.8" fill="white" opacity="0.95" />
                {/* Secondary highlight */}
                <circle cx="79" cy="92" r="1.2" fill="white" opacity="0.6" />
                {/* Upper eyelid line */}
                <path
                  d="M71 82 Q82 76, 93 82"
                  stroke="#2A1B0A"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Eyelashes — outer corner */}
                <path d="M92 83 L96 79" stroke="#2A1B0A" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M91 81 L94 77" stroke="#2A1B0A" strokeWidth="1" strokeLinecap="round" />
              </>
            )}
          </g>

          {/* Right eye */}
          <g>
            {eyesClosed ? (
              <path
                d={
                  isCelebrating
                    ? "M108 88 Q118 82, 128 88"
                    : "M108 88 Q118 92, 128 88"
                }
                stroke="#2A1B0A"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              <>
                <ellipse
                  cx="118"
                  cy="88"
                  rx={mood === "impressed" ? 12 : 10}
                  ry={mood === "impressed" ? 13 : 11}
                  fill="white"
                />
                <circle cx="118" cy="89" r="7" fill="url(#rm-iris)" />
                <circle cx="118" cy="89" r="3.5" fill="#0A1929" />
                <circle cx="122" cy="85" r="2.8" fill="white" opacity="0.95" />
                <circle cx="115" cy="92" r="1.2" fill="white" opacity="0.6" />
                <path
                  d="M107 82 Q118 76, 129 82"
                  stroke="#2A1B0A"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  fill="none"
                />
                <path d="M108 83 L104 79" stroke="#2A1B0A" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M109 81 L106 77" stroke="#2A1B0A" strokeWidth="1" strokeLinecap="round" />
              </>
            )}
          </g>
        </g>

        {/* ── Eyebrows ── */}
        <path
          d={
            mood === "impressed"
              ? "M70 74 Q82 68, 92 74"
              : mood === "thinking"
              ? "M72 76 Q82 72, 92 74"
              : "M72 76 Q82 72, 92 76"
          }
          stroke="#B8860B"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={
            mood === "impressed"
              ? "M108 74 Q118 68, 130 74"
              : mood === "thinking"
              ? "M108 74 Q118 70, 128 76"
              : "M108 76 Q118 72, 128 76"
          }
          stroke="#B8860B"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />

        {/* ── Nose ── */}
        <path
          d="M98 104 Q100 107, 102 104"
          stroke="rgba(180,140,100,0.35)"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* ── Mouth (lip-synced) ── */}
        <MascotMouth mouthOpen={mouthOpen} mood={mood} />

        {/* ── Sparkles when celebrating ── */}
        {isCelebrating && (
          <g>
            {[0, 60, 120, 180, 240, 300].map((angle, i) => {
              const rad = (angle * Math.PI) / 180
              const r = 80
              const cx = 100 + r * Math.cos(rad)
              const cy = 95 + r * Math.sin(rad)
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r="2.5"
                  fill="#FFD740"
                  opacity="0.9"
                  className="animate-mascot-sparkle-particle"
                  style={{ animationDelay: `${i * 0.12}s` }}
                />
              )
            })}
          </g>
        )}
      </svg>
    </div>
  )
}

// ── Animated mouth sub-component ──
function MascotMouth({ mouthOpen, mood }: { mouthOpen: number; mood: MascotMood }) {
  const isCelebrating = mood === "celebrating" || mood === "cheering"

  // Celebrating override: big grin
  if (isCelebrating && mouthOpen < 0.1) {
    return (
      <g>
        <path
          d="M88 114 Q100 126, 112 114"
          stroke="#C4706A"
          strokeWidth="1.5"
          fill="rgba(180,60,60,0.15)"
          strokeLinecap="round"
        />
      </g>
    )
  }

  // Closed mouth — gentle smile
  if (mouthOpen < 0.06) {
    return (
      <path
        d="M90 114 Q100 119, 110 114"
        stroke="#C4706A"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    )
  }

  // Open mouth — lip sync
  const hw = 11 + mouthOpen * 4 // half-width 11-15
  const topY = 114
  const botY = 114 + mouthOpen * 14 // opens 0-14px
  const cx = 100

  return (
    <g>
      {/* Mouth interior */}
      <path
        d={`M${cx - hw} ${topY}
            Q${cx} ${botY}, ${cx + hw} ${topY}
            Q${cx} ${topY - 1.5}, ${cx - hw} ${topY}`}
        fill="#6B1A2A"
      />
      {/* Teeth (top) */}
      {mouthOpen > 0.15 && (
        <rect
          x={cx - hw + 3}
          y={topY}
          width={(hw - 3) * 2}
          height={Math.min(mouthOpen * 6, 4.5)}
          rx="1.5"
          fill="white"
          opacity="0.92"
        />
      )}
      {/* Tongue hint at higher openness */}
      {mouthOpen > 0.45 && (
        <ellipse
          cx={cx}
          cy={topY + mouthOpen * 9}
          rx={hw * 0.5}
          ry={mouthOpen * 3}
          fill="#D4626A"
          opacity="0.6"
        />
      )}
      {/* Upper lip */}
      <path
        d={`M${cx - hw} ${topY} Q${cx} ${topY - 2}, ${cx + hw} ${topY}`}
        stroke="#C4706A"
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
      />
      {/* Lower lip */}
      <path
        d={`M${cx - hw} ${topY} Q${cx} ${botY + 1}, ${cx + hw} ${topY}`}
        stroke="#C4706A"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />
    </g>
  )
}
