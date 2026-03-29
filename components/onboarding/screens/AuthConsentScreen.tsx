"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, Apple } from "lucide-react"
import { cn } from "@/lib/utils"

interface AuthConsentScreenProps {
  onGoogleAuth: () => void
  onAppleAuth: () => void
  onEmailAuth: () => void
}

const CHECKBOXES = [
  "I understand Rumi is an AI coach, not a licensed therapist or medical provider.",
  "I'm 18 years old or older.",
  "I agree to the Terms of Service and Privacy Policy.",
]

export function AuthConsentScreen({
  onGoogleAuth,
  onAppleAuth,
  onEmailAuth,
}: AuthConsentScreenProps) {
  const [checked, setChecked] = useState([false, false, false])

  const allChecked = checked.every(Boolean)

  function toggle(index: number) {
    setChecked((prev) => prev.map((v, i) => (i === index ? !v : v)))
  }

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-between bg-[#080808] px-6 py-12">
      <div />

      <div className="w-full max-w-md">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-2 text-center text-2xl font-bold text-white"
        >
          Your safe space
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8 text-center text-[15px] text-white/50"
        >
          Save your progress by creating an account.
        </motion.p>

        <div className="mb-8 flex flex-col gap-4">
          {CHECKBOXES.map((label, i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              className="flex items-start gap-3 text-left"
            >
              <div
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
                  checked[i]
                    ? "border-[#FFD41A] bg-[#FFD41A]"
                    : "border-white/30"
                )}
              >
                {checked[i] && <Check className="h-3 w-3 text-white" />}
              </div>
              <span className="text-[14px] leading-snug text-white/70">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-3">
        <button
          type="button"
          disabled={!allChecked}
          onClick={onAppleAuth}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-full py-4 text-[16px] font-semibold transition-all",
            allChecked
              ? "bg-white text-black hover:bg-white/90"
              : "bg-white/10 text-white/30 cursor-not-allowed"
          )}
        >
          <Apple className="h-5 w-5" />
          Continue with Apple
        </button>

        <button
          type="button"
          disabled={!allChecked}
          onClick={onGoogleAuth}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-full py-4 text-[16px] font-semibold transition-all",
            allChecked
              ? "bg-[#FFD41A] text-white shadow-[0_8px_16px_rgba(204,170,0,0.35)] hover:bg-[#E6BF17]"
              : "bg-white/10 text-white/30 cursor-not-allowed"
          )}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        <button
          type="button"
          disabled={!allChecked}
          onClick={onEmailAuth}
          className={cn(
            "text-[14px] font-medium transition-colors",
            allChecked ? "text-white/60 hover:text-white" : "text-white/20 cursor-not-allowed"
          )}
        >
          Continue with Email
        </button>
      </div>
    </div>
  )
}
