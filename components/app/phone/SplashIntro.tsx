"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const SPLASH_KEY = "rumi_splash_seen"

/**
 * Cinematic splash intro.
 *
 * Phase 1 "logo"    — Full "Rumi" wordmark fades in with golden glow
 * Phase 2 "morph"   — Wordmark fades, sun icon remains in circular frame + light burst
 * Phase 3 "fly"     — Icon scales down to avatar position, dark bg dissolves, app reveals
 * Phase 4 "done"    — Splash removed from DOM
 */
export function SplashIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"logo" | "morph" | "fly" | "done">("logo")

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("morph"), 1200),
      setTimeout(() => setPhase("fly"), 2200),
      setTimeout(() => {
        setPhase("done")
        sessionStorage.setItem(SPLASH_KEY, "1")
        onComplete()
      }, 3600),
    ]
    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  const isFlying = phase === "fly"
  const isMorphedOrFlying = phase === "morph" || phase === "fly"

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Dark background */}
          <motion.div
            className="absolute inset-0"
            style={{ background: "#0A0A0A" }}
            animate={{ opacity: isFlying ? 0 : 1 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />

          {/* Golden radial glow — pulses during logo, bursts on morph, fades on fly */}
          <motion.div
            className="absolute"
            style={{
              width: 400,
              height: 400,
              background:
                "radial-gradient(circle, rgba(245,197,24,0.2) 0%, rgba(245,197,24,0.06) 40%, transparent 70%)",
              borderRadius: "50%",
            }}
            animate={
              isFlying
                ? { scale: 3, opacity: 0 }
                : isMorphedOrFlying
                  ? { scale: 1.8, opacity: 0.6 }
                  : { scale: [1, 1.15, 1], opacity: 1 }
            }
            transition={
              isFlying
                ? { duration: 1.0, ease: "easeOut" }
                : isMorphedOrFlying
                  ? { duration: 0.6, ease: "easeOut" }
                  : { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
            }
          />

          {/* Full "Rumi" wordmark — visible during logo phase only */}
          <motion.img
            src="/rumi_logo.png"
            alt="Rumi"
            className="absolute"
            style={{ width: 220, height: "auto", objectFit: "contain" }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: isMorphedOrFlying ? 0 : 1,
              scale: isMorphedOrFlying ? 0.85 : 1,
            }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />

          {/* Sun icon in circular frame — hidden during logo, appears on morph, flies on fly */}
          <motion.div
            className="absolute"
            style={{ willChange: "transform" }}
            initial={{ opacity: 0, scale: 2.5 }}
            animate={
              isFlying
                ? {
                    opacity: 1,
                    scale: 1,
                    y: -(window.innerHeight / 2 - 88),
                  }
                : isMorphedOrFlying
                  ? { opacity: 1, scale: 2.5, y: 0 }
                  : { opacity: 0, scale: 2.5, y: 0 }
            }
            transition={{
              duration: isFlying ? 1.2 : 0.5,
              ease: isFlying ? [0.22, 1, 0.36, 1] : "easeOut",
            }}
          >
            <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-white/20 shadow-2xl bg-[#0A0A0A]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/mascot/rumi_app_icon.png"
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          </motion.div>

          {/* Light ring burst on morph — expands outward */}
          {isMorphedOrFlying && (
            <motion.div
              className="absolute rounded-full"
              style={{
                width: 100,
                height: 100,
                border: "2px solid rgba(245,197,24,0.4)",
                boxShadow: "0 0 40px rgba(245,197,24,0.15)",
              }}
              initial={{ scale: 0.5, opacity: 0.8 }}
              animate={{ scale: isFlying ? 8 : 4, opacity: 0 }}
              transition={{ duration: isFlying ? 1.0 : 0.8, ease: "easeOut" }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Returns true if the splash has already been shown this session */
export function hasSplashPlayed(): boolean {
  if (typeof window === "undefined") return true
  return sessionStorage.getItem(SPLASH_KEY) === "1"
}
