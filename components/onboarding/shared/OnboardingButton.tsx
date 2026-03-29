"use client"

import { cn } from "@/lib/utils"

interface OnboardingButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: "primary" | "secondary"
  className?: string
}

export function OnboardingButton({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  className,
}: OnboardingButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full rounded-full px-8 py-4 text-[17px] font-semibold transition-all",
        variant === "primary" && [
          "bg-[#FFD41A] text-white shadow-[0_8px_16px_rgba(204,170,0,0.35)]",
          "hover:bg-[#E6BF17] active:scale-[0.98]",
          "disabled:opacity-40 disabled:shadow-none",
        ],
        variant === "secondary" && [
          "border border-white/20 bg-transparent text-white/80",
          "hover:border-white/40 hover:text-white",
          "disabled:opacity-40",
        ],
        className
      )}
    >
      {children}
    </button>
  )
}
