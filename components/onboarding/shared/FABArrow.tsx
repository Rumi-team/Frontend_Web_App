"use client"

import { cn } from "@/lib/utils"
import { ArrowRight, Check } from "lucide-react"

interface FABArrowProps {
  onClick: () => void
  disabled?: boolean
  /** Show checkmark instead of arrow (final step of a group) */
  isCheckmark?: boolean
}

export function FABArrow({
  onClick,
  disabled = false,
  isCheckmark = false,
}: FABArrowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "fixed bottom-8 right-6 z-10 flex h-14 w-14 items-center justify-center rounded-full transition-all",
        disabled
          ? "bg-white/10 text-white/30"
          : "bg-[#FFD41A] text-white shadow-[0_4px_12px_rgba(204,170,0,0.4)] hover:bg-[#E6BF17] active:scale-95"
      )}
    >
      {isCheckmark ? (
        <Check className="h-6 w-6" />
      ) : (
        <ArrowRight className="h-6 w-6" />
      )}
    </button>
  )
}
