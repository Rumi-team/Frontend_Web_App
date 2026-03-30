"use client"

import { motion } from "framer-motion"

interface SegmentedControlProps {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
}

export function SegmentedControl({ options, value, onChange }: SegmentedControlProps) {
  return (
    <div className="flex rounded-full bg-gray-100 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className="relative flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors"
        >
          {value === option.value && (
            <motion.div
              layoutId="segmented-bg"
              className="absolute inset-0 rounded-full bg-gray-800"
              transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
            />
          )}
          <span className={`relative z-10 ${value === option.value ? "text-white" : "text-gray-500"}`}>
            {option.label}
          </span>
        </button>
      ))}
    </div>
  )
}
