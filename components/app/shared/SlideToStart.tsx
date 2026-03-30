"use client"

import { useRef, useState } from "react"
import { motion, useMotionValue, useTransform } from "framer-motion"
import { ArrowRight } from "lucide-react"

interface SlideToStartProps {
  onComplete: () => void
  label?: string
}

export function SlideToStart({ onComplete, label = "Slide to start session" }: SlideToStartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [completed, setCompleted] = useState(false)
  const x = useMotionValue(0)

  const handleDragEnd = () => {
    const container = containerRef.current
    if (!container) return
    const maxDrag = container.offsetWidth - 56
    if (x.get() > maxDrag * 0.8) {
      setCompleted(true)
      onComplete()
    }
  }

  const opacity = useTransform(x, [0, 100], [1, 0.3])

  if (completed) return null

  return (
    <div
      ref={containerRef}
      className="relative flex h-14 items-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm"
    >
      {/* Label */}
      <motion.span
        style={{ opacity }}
        className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white/70 pointer-events-none"
      >
        {label}
      </motion.span>

      {/* Draggable handle */}
      <motion.div
        drag="x"
        dragConstraints={containerRef}
        dragElastic={0}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="relative z-10 ml-1 flex h-12 w-12 cursor-grab items-center justify-center rounded-full bg-white shadow-lg active:cursor-grabbing"
      >
        <ArrowRight className="h-5 w-5 text-gray-800" />
      </motion.div>
    </div>
  )
}
