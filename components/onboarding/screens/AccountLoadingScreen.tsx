"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

interface AccountLoadingScreenProps {
  onComplete: () => void
  timeoutMs?: number
}

export function AccountLoadingScreen({
  onComplete,
  timeoutMs = 2000,
}: AccountLoadingScreenProps) {
  useEffect(() => {
    const timeout = setTimeout(onComplete, timeoutMs)
    return () => clearTimeout(timeout)
  }, [onComplete, timeoutMs])

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#080808]">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6"
      >
        <Loader2 className="h-12 w-12 animate-spin text-[#FFD41A]" />
        <p className="text-[17px] font-medium text-white">
          Creating your account...
        </p>
      </motion.div>
    </div>
  )
}
