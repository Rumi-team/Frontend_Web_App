"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, Mic, RotateCcw, Settings } from "lucide-react"

interface ConnectionErrorProps {
  message: string
  onRetry: () => void
  isMicError?: boolean
}

export function ConnectionError({ message, onRetry, isMicError }: ConnectionErrorProps) {
  const [requesting, setRequesting] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const handleEnableMic = async () => {
    setRequesting(true)
    setShowSettings(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((t) => t.stop())
      // Permission granted — retry the connection
      onRetry()
    } catch {
      // Browser still blocking — show settings instructions
      setShowSettings(true)
    } finally {
      setRequesting(false)
    }
  }

  if (isMicError) {
    return (
      <div className="flex flex-col items-center gap-6 text-center max-w-sm px-6">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full"
          style={{ background: "rgba(255, 212, 26, 0.12)" }}
        >
          <Mic className="h-10 w-10" style={{ color: "rgb(255, 212, 26)" }} />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-white">Microphone Required</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Rumi needs microphone access to hear you during coaching sessions.
          </p>
        </div>

        <Button
          onClick={handleEnableMic}
          disabled={requesting}
          className="w-full py-6 text-base font-semibold text-black rounded-2xl"
          style={{ background: "rgb(255, 212, 26)" }}
        >
          {requesting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
              Requesting...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Enable Microphone
            </span>
          )}
        </Button>

        {showSettings && (
          <div
            className="w-full rounded-2xl p-4 text-left space-y-2"
            style={{ background: "rgba(255, 255, 255, 0.06)" }}
          >
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <Settings className="h-4 w-4 text-gray-400" />
              Open browser settings to allow microphone:
            </div>
            <ol className="text-xs text-gray-400 space-y-1 pl-6 list-decimal">
              <li>Tap the lock/info icon in the address bar</li>
              <li>Find &quot;Microphone&quot; and set to &quot;Allow&quot;</li>
              <li>Reload the page</li>
            </ol>
          </div>
        )}

        <button
          onClick={onRetry}
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center max-w-sm px-6">
      <AlertCircle className="h-10 w-10 text-red-400" />
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-white">Connection Error</h2>
        <p className="text-sm text-gray-400">{message}</p>
      </div>
      <Button
        onClick={onRetry}
        variant="outline"
        className="border-gray-700 text-white hover:bg-gray-800"
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        Retry
      </Button>
    </div>
  )
}
