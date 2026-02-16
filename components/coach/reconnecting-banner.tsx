"use client"

import { Loader2 } from "lucide-react"

export function ReconnectingBanner() {
  return (
    <div className="flex items-center justify-center gap-2 bg-yellow-400/10 px-4 py-2 text-sm text-yellow-400">
      <Loader2 className="h-3 w-3 animate-spin" />
      Reconnecting...
    </div>
  )
}
