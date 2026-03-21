"use client"

import { useEffect, useRef, useState } from "react"

interface MicVisualizerProps {
  isMicEnabled: boolean
}

export function MicVisualizer({ isMicEnabled }: MicVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [hasStream, setHasStream] = useState(false)

  useEffect(() => {
    if (!isMicEnabled) {
      // Clean up
      cancelAnimationFrame(animFrameRef.current)
      sourceRef.current?.disconnect()
      audioCtxRef.current?.close()
      streamRef.current?.getTracks().forEach((t) => t.stop())
      audioCtxRef.current = null
      analyserRef.current = null
      sourceRef.current = null
      streamRef.current = null
      setHasStream(false)
      return
    }

    let cancelled = false

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        const audioCtx = new AudioContext()
        audioCtxRef.current = audioCtx
        const source = audioCtx.createMediaStreamSource(stream)
        sourceRef.current = source
        const analyser = audioCtx.createAnalyser()
        analyser.fftSize = 128
        analyser.smoothingTimeConstant = 0.7
        source.connect(analyser)
        analyserRef.current = analyser
        setHasStream(true)
      })
      .catch(() => {
        // Mic access denied — silently fail
      })

    return () => {
      cancelled = true
      cancelAnimationFrame(animFrameRef.current)
      sourceRef.current?.disconnect()
      audioCtxRef.current?.close()
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [isMicEnabled])

  useEffect(() => {
    if (!hasStream || !analyserRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const analyser = analyserRef.current
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const barCount = 20
    const barWidth = 4
    const gap = 3
    const totalWidth = barCount * (barWidth + gap) - gap
    const height = 48

    canvas.width = totalWidth
    canvas.height = height

    function draw() {
      animFrameRef.current = requestAnimationFrame(draw)
      analyser.getByteFrequencyData(dataArray)

      ctx!.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < barCount; i++) {
        // Sample from lower frequencies (voice range)
        const idx = Math.floor((i / barCount) * (bufferLength * 0.6))
        const value = dataArray[idx] ?? 0
        const barHeight = Math.max(4, (value / 255) * height * 0.85)
        const x = i * (barWidth + gap)
        const y = (height - barHeight) / 2

        // Golden gradient based on height
        const intensity = value / 255
        const r = 250
        const g = Math.round(180 + intensity * 50)
        const b = Math.round(20 + intensity * 10)
        ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.6 + intensity * 0.4})`
        ctx!.beginPath()
        ctx!.roundRect(x, y, barWidth, barHeight, 2)
        ctx!.fill()
      }
    }

    draw()

    return () => {
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [hasStream])

  if (!isMicEnabled) return null

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas
        ref={canvasRef}
        className="opacity-90"
        style={{ width: 137, height: 48 }}
      />
    </div>
  )
}
