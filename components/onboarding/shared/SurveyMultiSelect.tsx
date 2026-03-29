"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface SurveyMultiSelectProps {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
}

export function SurveyMultiSelect({
  options,
  selected,
  onChange,
}: SurveyMultiSelectProps) {
  function toggle(option: string) {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option))
    } else {
      onChange([...selected, option])
    }
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <p className="text-sm text-white/50">Select all that apply</p>
      {options.map((opt) => {
        const isSelected = selected.includes(opt)
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={cn(
              "flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-all",
              isSelected
                ? "border-[#FFD41A] bg-[#FFD41A]/10"
                : "border-white/10 bg-white/5 hover:border-white/20"
            )}
          >
            <div
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-colors",
                isSelected
                  ? "border-[#FFD41A] bg-[#FFD41A]"
                  : "border-white/30"
              )}
            >
              {isSelected && <Check className="h-4 w-4 text-white" />}
            </div>
            <span className="text-[15px] font-medium text-white">{opt}</span>
          </button>
        )
      })}
    </div>
  )
}
