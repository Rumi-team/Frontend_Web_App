"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useSettingsStore } from "@/store/settingsStore"
import { useTheme } from "next-themes"
import { SegmentedControl } from "@/components/app/shared/SegmentedControl"
import { Check } from "lucide-react"
import Image from "next/image"

interface AppearanceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const THEMES = [
  { id: "forest_light", name: "Forest Light", color: "#4A6741", image: "/themes/forest-light.jpg" },
  { id: "mountain_lake", name: "Mountain Lake", color: "#4A6B8A", image: "/themes/mountain-lake.jpg" },
  { id: "ocean_horizon", name: "Ocean Horizon", color: "#2A5B7C", image: "/themes/ocean-horizon.jpg" },
  { id: "sunset_sky", name: "Sunset Sky", color: "#C4724E", image: "/themes/sunset-sky.jpg" },
]

export function AppearanceModal({ open, onOpenChange }: AppearanceModalProps) {
  const selectedTheme = useSettingsStore((s) => s.selectedTheme)
  const lightDark = useSettingsStore((s) => s.lightDark)
  const setField = useSettingsStore((s) => s.setField)
  const { setTheme } = useTheme()

  function handleLightDark(val: string) {
    const mode = val as "light" | "dark"
    setField("lightDark", mode)
    setTheme(mode)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl bg-white dark:bg-gray-900">
        <SheetHeader>
          <SheetTitle className="text-gray-900 dark:text-gray-100">Background Image</SheetTitle>
        </SheetHeader>

        <div className="mt-4">
          <SegmentedControl
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
            value={lightDark}
            onChange={handleLightDark}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setField("selectedTheme", theme.id)}
              className={`relative aspect-[3/2] rounded-2xl overflow-hidden transition-all ${
                selectedTheme === theme.id ? "ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-gray-900" : ""
              }`}
            >
              <div className="absolute inset-0" style={{ backgroundColor: theme.color }} />
              <Image src={theme.image} alt={theme.name} fill sizes="(max-width: 640px) 45vw, 200px" className="object-cover" />
              <div className="absolute inset-0 flex items-end p-3 bg-gradient-to-t from-black/30 to-transparent">
                <span className="text-xs font-medium text-white">{theme.name}</span>
              </div>
              {selectedTheme === theme.id && (
                <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white">
                  <Check className="h-4 w-4 text-gray-800" />
                </div>
              )}
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
