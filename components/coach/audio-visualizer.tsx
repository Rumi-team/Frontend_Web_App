"use client"

import { useEffect, useRef } from "react"

interface AudioVisualizerProps {
  audioTrack: MediaStreamTrack | null
}

export function AudioVisualizer({ audioTrack }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)

  useEffect(() => {
    if (!audioTrack || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const audioCtx = new AudioContext()
    const source = audioCtx.createMediaStreamSource(
      new MediaStream([audioTrack])
    )
    const analyser = audioCtx.createAnalyser()
    analyser.fftSize = 64
    source.connect(analyser)

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    const barCount = 7
    const barWidth = 5
    const gap = 4
    const totalWidth = barCount * (barWidth + gap) - gap

    canvas.width = totalWidth
    canvas.height = 56

    function draw() {
      animFrameRef.current = requestAnimationFrame(draw)
      analyser.getByteFrequencyData(dataArray)

      ctx!.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i] ?? 0
        const barHeight = Math.max(2, (value / 255) * canvas.height)
        const x = i * (barWidth + gap)
        const y = (canvas.height - barHeight) / 2

        const intensity = value / 255
        ctx!.fillStyle = `rgba(255, 212, 26, ${0.5 + intensity * 0.5})`
        ctx!.beginPath()
        ctx!.roundRect(x, y, barWidth, barHeight, 2)
        ctx!.fill()
      }
    }

    draw()

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      source.disconnect()
      audioCtx.close()
    }
  }, [audioTrack])

  if (!audioTrack) return null

  return (
    <canvas
      ref={canvasRef}
      className="opacity-80"
      style={{ imageRendering: "pixelated" }}
    />
  )
}
