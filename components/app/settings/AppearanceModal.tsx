"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useSettingsStore } from "@/store/settingsStore"
import { SegmentedControl } from "@/components/app/shared/SegmentedControl"
import { Check } from "lucide-react"

interface AppearanceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const THEMES = [
  { id: "forest_light", name: "Forest Light", color: "#4A6741" },
  { id: "mountain_lake", name: "Mountain Lake", color: "#4A6B8A" },
  { id: "ocean_horizon", name: "Ocean Horizon", color: "#2A5B7C" },
  { id: "sunset_sky", name: "Sunset Sky", color: "#C4724E" },
]

export function AppearanceModal({ open, onOpenChange }: AppearanceModalProps) {
  const selectedTheme = useSettingsStore((s) => s.selectedTheme)
  const lightDark = useSettingsStore((s) => s.lightDark)
  const setField = useSettingsStore((s) => s.setField)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl bg-white">
        <SheetHeader>
          <SheetTitle>Background Image</SheetTitle>
        </SheetHeader>

        {/* Light/Dark */}
        <div className="mt-4">
          <SegmentedControl
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
            value={lightDark}
            onChange={(val) => setField("lightDark", val as "light" | "dark")}
          />
        </div>

        {/* Theme grid */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setField("selectedTheme", theme.id)}
              className={`relative aspect-[3/2] rounded-2xl overflow-hidden transition-all ${
                selectedTheme === theme.id ? "ring-2 ring-gray-800 ring-offset-2" : ""
              }`}
              style={{ backgroundColor: theme.color }}
            >
              <div className="absolute inset-0 flex items-end p-3">
                <span className="text-xs font-medium text-white/80">{theme.name}</span>
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
