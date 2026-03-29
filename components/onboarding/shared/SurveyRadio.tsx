"use client"

import { cn } from "@/lib/utils"

interface SurveyOption {
  value: string
  label: string
  description?: string
}

interface SurveyRadioProps {
  options: SurveyOption[]
  value: string
  onChange: (value: string) => void
}

export function SurveyRadio({ options, value, onChange }: SurveyRadioProps) {
  return (
    <div className="flex w-full flex-col gap-3">
      {options.map((opt) => {
        const selected = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-all",
              selected
                ? "border-[#FFD41A] bg-[#FFD41A]/10"
                : "border-white/10 bg-white/5 hover:border-white/20"
            )}
          >
            <div
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                selected
                  ? "border-[#FFD41A] bg-[#FFD41A]"
                  : "border-white/30"
              )}
            >
              {selected && (
                <div className="h-2.5 w-2.5 rounded-full bg-white" />
              )}
            </div>
            <div>
              <div className="text-[15px] font-medium text-white">
                {opt.label}
              </div>
              {opt.description && (
                <div className="mt-0.5 text-[13px] text-white/50">
                  {opt.description}
                </div>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
