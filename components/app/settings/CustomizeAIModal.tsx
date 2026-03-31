"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useSettingsStore } from "@/store/settingsStore"

interface CustomizeAIModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const VOICES = [
  { id: "aoede", name: "Aoede" },
  { id: "david", name: "David" },
  { id: "jasmine", name: "Jasmine" },
  { id: "linda", name: "Linda" },
]

const STYLES = [
  { id: "gentle", label: "Gentle & Warm" },
  { id: "direct", label: "Direct & Clear" },
  { id: "motivational", label: "Motivational" },
  { id: "analytical", label: "Analytical" },
]

export function CustomizeAIModal({ open, onOpenChange }: CustomizeAIModalProps) {
  const selectedVoice = useSettingsStore((s) => s.selectedVoice)
  const aiStyle = useSettingsStore((s) => s.aiStyle)
  const customInstructions = useSettingsStore((s) => s.customInstructions)
  const radarCalibration = useSettingsStore((s) => s.radarCalibration)
  const setField = useSettingsStore((s) => s.setField)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl bg-white max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Customize your AI</SheetTitle>
        </SheetHeader>

        {/* Voice selection */}
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Voice</p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {VOICES.map((voice) => (
              <button
                key={voice.id}
                onClick={() => setField("selectedVoice", voice.id)}
                className={`flex flex-col items-center gap-2 px-4 py-3 rounded-2xl shrink-0 transition-colors ${
                  selectedVoice === voice.id ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-700"
                }`}
              >
                <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-lg font-medium">
                  {voice.name.charAt(0)}
                </div>
                <span className="text-xs font-medium">{voice.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* AI Style */}
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">AI Style</p>
          <div className="flex flex-col gap-2">
            {STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => setField("aiStyle", style.id)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
                  aiStyle === style.id ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-700"
                }`}
              >
                <div
                  className={`h-4 w-4 rounded-full border-2 ${
                    aiStyle === style.id ? "border-white bg-white" : "border-gray-300"
                  }`}
                >
                  {aiStyle === style.id && <div className="h-full w-full rounded-full bg-gray-800 scale-50" />}
                </div>
                {style.label}
              </button>
            ))}
          </div>
        </div>

        {/* Radar preview */}
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Calibration</p>
          <div className="rounded-xl bg-gray-50 p-4">
            {Object.entries(radarCalibration).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between py-1">
                <span className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                <div className="h-1.5 w-24 rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{ width: `${(value as number) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom instructions */}
        <div className="mt-6 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Custom Instructions</p>
          <textarea
            value={customInstructions}
            onChange={(e) => setField("customInstructions", e.target.value)}
            placeholder="Add any special instructions for your AI coach..."
            className="w-full min-h-[80px] rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-gray-400 resize-none"
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
