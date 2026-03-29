"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Loader2 } from "lucide-react"

interface ProgressiveChecklistProps {
  items: string[]
  /** Delay between each item completing (ms) */
  delayMs?: number
  /** Called when all items complete */
  onComplete?: () => void
}

export function ProgressiveChecklist({
  items,
  delayMs = 600,
  onComplete,
}: ProgressiveChecklistProps) {
  const [completedCount, setCompletedCount] = useState(0)

  useEffect(() => {
    if (completedCount >= items.length) {
      const timeout = setTimeout(() => onComplete?.(), 500)
      return () => clearTimeout(timeout)
    }

    const timeout = setTimeout(() => {
      setCompletedCount((c) => c + 1)
    }, delayMs)

    return () => clearTimeout(timeout)
  }, [completedCount, items.length, delayMs, onComplete])

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      {items.map((item, i) => {
        const isComplete = i < completedCount
        const isActive = i === completedCount

        return (
          <motion.div
            key={item}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center">
              <AnimatePresence mode="wait">
                {isComplete ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFD41A]"
                  >
                    <Check className="h-4 w-4 text-white" />
                  </motion.div>
                ) : isActive ? (
                  <motion.div key="spinner" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Loader2 className="h-5 w-5 animate-spin text-[#FFD41A]" />
                  </motion.div>
                ) : (
                  <div className="h-2 w-2 rounded-full bg-white/20" />
                )}
              </AnimatePresence>
            </div>
            <span
              className={
                isComplete
                  ? "text-[15px] text-white"
                  : isActive
                    ? "text-[15px] text-white/80"
                    : "text-[15px] text-white/30"
              }
            >
              {item}
            </span>
          </motion.div>
        )
      })}
    </div>
  )
}
