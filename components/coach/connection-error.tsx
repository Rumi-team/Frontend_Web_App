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

function openMicSettings() {
  const platform = detectPlatform()
  if (platform === "ios") {
    // Opens iOS Settings → Safari → Microphone
    window.location.href = "App-Prefs:root=Safari"
  } else if (platform === "android") {
    // Opens Android app settings (Chrome handles mic from there)
    window.location.href = "intent://settings#Intent;scheme=android-app;action=android.settings.APPLICATION_DETAILS_SETTINGS;end"
  } else {
    // Desktop — open browser settings in a new tab
    window.open("chrome://settings/content/microphone", "_blank")
  }
}

function PlatformInstructions() {
  const platform = detectPlatform()

  if (platform === "ios") {
    return (
      <ol className="text-sm text-gray-400 space-y-2 text-left w-full">
        <li>1. Tap <strong className="text-white">"Open Mic Settings"</strong> above</li>
        <li>2. On the Settings screen, tap <strong className="text-white">Microphone</strong></li>
        <li>3. Switch it to <strong className="text-white">Allow</strong></li>
        <li>4. Come back here and tap <strong className="text-white">Try Again</strong></li>
      </ol>
    )
  }

  if (platform === "android") {
    return (
      <ol className="text-sm text-gray-400 space-y-2 text-left w-full">
        <li>1. Tap the <strong className="text-white">lock icon</strong> in your browser&apos;s address bar</li>
        <li>2. Tap <strong className="text-white">Permissions → Microphone → Allow</strong></li>
        <li>3. Tap <strong className="text-white">Try Again</strong> below</li>
      </ol>
    )
  }

  return (
    <ol className="text-sm text-gray-400 space-y-2 text-left w-full">
      <li>1. Click the <strong className="text-white">lock icon</strong> in your address bar</li>
      <li>2. Set <strong className="text-white">Microphone</strong> to <strong className="text-white">Allow</strong></li>
      <li>3. Reload the page</li>
    </ol>
  )
}

export function ConnectionError({ message, onRetry, isMicError, permissionState }: ConnectionErrorProps) {
  const [requesting, setRequesting] = useState(false)
  const platform = detectPlatform()
  const isMobile = platform === "ios" || platform === "android"

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
    const isDenied = permissionState === "denied"

    return (
      <div className="flex flex-col items-center gap-5 text-center max-w-sm w-full px-6">
        {/* Icon */}
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full"
          style={{ background: "rgba(255, 212, 26, 0.12)" }}
        >
          <Mic className="h-10 w-10" style={{ color: "rgb(255, 212, 26)" }} />
        </div>

        {/* Title + explanation */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-white">Rumi Needs Your Mic</h2>
          <p className="text-base text-gray-300 leading-relaxed">
            Rumi coaches you through <strong className="text-white">real conversations</strong> — it listens, understands what you&apos;re going through, and responds out loud. Your microphone is how that connection happens.
          </p>
          <p className="text-sm text-gray-500">
            {isDenied
              ? "It looks like microphone access was blocked. You can turn it on in your browser settings — takes 10 seconds."
              : "Tap below to allow microphone access and start your session."}
          </p>
        </div>

        {/* Primary CTA */}
        {isDenied ? (
          isMobile ? (
            <button
              onClick={openMicSettings}
              className="w-full py-4 rounded-2xl text-black text-base font-bold flex items-center justify-center gap-2 transition-opacity active:opacity-80"
              style={{ background: "rgb(255, 212, 26)" }}
            >
              <Settings className="h-5 w-5" />
              Open Mic Settings
            </button>
          ) : (
            <button
              onClick={openMicSettings}
              className="w-full py-4 rounded-2xl text-black text-base font-bold flex items-center justify-center gap-2 transition-opacity active:opacity-80"
              style={{ background: "rgb(255, 212, 26)" }}
            >
              <Settings className="h-5 w-5" />
              Open Browser Settings
            </button>
          )
        ) : (
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
                Allow Microphone
              </span>
            )}
          </Button>
        )}

        {/* Step-by-step instructions (collapsed on mobile, always shown on desktop) */}
        {isDenied && (
          <div
            className="w-full rounded-2xl p-4 text-left space-y-3"
            style={{ background: "rgba(255, 255, 255, 0.05)" }}
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              {isMobile ? <Smartphone className="h-4 w-4 text-yellow-400" /> : <Settings className="h-4 w-4 text-yellow-400" />}
              How to turn it on:
            </div>
            <PlatformInstructions />
          </div>
        )}

        <button
          onClick={onRetry}
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          Try Again
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
