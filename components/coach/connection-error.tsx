"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, Mic, RotateCcw, Settings, Smartphone } from "lucide-react"
import type { MicPermissionState } from "@/hooks/use-microphone-permission"

interface ConnectionErrorProps {
  message: string
  onRetry: () => void
  isMicError?: boolean
  permissionState?: MicPermissionState
}

function detectPlatform(): "ios" | "android" | "desktop" {
  if (typeof navigator === "undefined") return "desktop"
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return "ios"
  if (/Android/i.test(ua)) return "android"
  return "desktop"
}

function PlatformInstructions() {
  const platform = detectPlatform()

  if (platform === "ios") {
    return (
      <div
        className="w-full rounded-2xl p-4 text-left space-y-2"
        style={{ background: "rgba(255, 255, 255, 0.06)" }}
      >
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <Smartphone className="h-4 w-4 text-gray-400" />
          Enable microphone on iOS:
        </div>
        <ol className="text-xs text-gray-400 space-y-1 pl-6 list-decimal">
          <li>Open <strong className="text-gray-300">Settings</strong> on your iPhone</li>
          <li>Scroll down and tap <strong className="text-gray-300">Safari</strong> (or your browser)</li>
          <li>Tap <strong className="text-gray-300">Microphone</strong> and set to <strong className="text-gray-300">Allow</strong></li>
          <li>Come back here and tap <strong className="text-gray-300">Try again</strong></li>
        </ol>
      </div>
    )
  }

  if (platform === "android") {
    return (
      <div
        className="w-full rounded-2xl p-4 text-left space-y-2"
        style={{ background: "rgba(255, 255, 255, 0.06)" }}
      >
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <Settings className="h-4 w-4 text-gray-400" />
          Enable microphone on Android:
        </div>
        <ol className="text-xs text-gray-400 space-y-1 pl-6 list-decimal">
          <li>Tap the <strong className="text-gray-300">lock icon</strong> in the address bar</li>
          <li>Tap <strong className="text-gray-300">Permissions</strong></li>
          <li>Set <strong className="text-gray-300">Microphone</strong> to <strong className="text-gray-300">Allow</strong></li>
          <li>Tap <strong className="text-gray-300">Try again</strong> below</li>
        </ol>
      </div>
    )
  }

  return (
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
  )
}

export function ConnectionError({ message, onRetry, isMicError, permissionState }: ConnectionErrorProps) {
  const [requesting, setRequesting] = useState(false)

  const handleEnableMic = async () => {
    setRequesting(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((t) => t.stop())
      onRetry()
    } catch {
      // Will stay on denied view since permissionState updates via the hook
    } finally {
      setRequesting(false)
    }
  }

  if (isMicError) {
    // If permission is already denied, skip the broken Enable button
    // and show platform-specific instructions directly
    const isDenied = permissionState === "denied"

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
            {isDenied
              ? "Microphone access was denied. Please update your browser settings to allow microphone access."
              : "Rumi needs microphone access to hear you during coaching sessions."}
          </p>
        </div>

        {/* Show Enable button only when permission can still be prompted */}
        {!isDenied && (
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
        )}

        {/* Show platform-specific instructions when denied */}
        {isDenied && <PlatformInstructions />}

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
