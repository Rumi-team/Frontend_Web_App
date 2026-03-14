"use client"

import { useState, useCallback, useEffect } from "react"
import posthog from "posthog-js"

export type MicPermissionState = "granted" | "prompt" | "denied" | "unknown"

interface UseMicrophonePermissionReturn {
  hasPermission: boolean | null
  permissionState: MicPermissionState
  requestPermission: () => Promise<boolean>
  error: string | null
}

export function useMicrophonePermission(): UseMicrophonePermissionReturn {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [permissionState, setPermissionState] = useState<MicPermissionState>("unknown")
  const [error, setError] = useState<string | null>(null)

  // Check permission state on mount via Permissions API
  useEffect(() => {
    let cancelled = false

    async function checkPermission() {
      try {
        const result = await navigator.permissions.query({ name: "microphone" as PermissionName })
        if (cancelled) return

        const state = result.state as MicPermissionState
        setPermissionState(state)
        posthog.capture("mic_permission_state", { state })

        if (state === "granted") {
          setHasPermission(true)
        } else if (state === "denied") {
          setHasPermission(false)
          setError(
            "Microphone access denied. Please allow microphone access in your browser settings."
          )
        }

        // Listen for changes (e.g. user grants in browser settings tab)
        result.addEventListener("change", () => {
          if (cancelled) return
          const newState = result.state as MicPermissionState
          setPermissionState(newState)
          if (newState === "granted") {
            setHasPermission(true)
            setError(null)
          }
        })
      } catch {
        // Permissions API not supported (older iOS Safari) — treat as unknown
        if (!cancelled) {
          setPermissionState("prompt")
        }
      }
    }

    checkPermission()
    return () => { cancelled = true }
  }, [])

  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Stop the test track immediately — LiveKit will create its own
      stream.getTracks().forEach((t) => t.stop())
      setHasPermission(true)
      setPermissionState("granted")
      setError(null)
      return true
    } catch (err) {
      setHasPermission(false)
      setPermissionState("denied")
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError(
          "Microphone access denied. Please allow microphone access in your browser settings."
        )
      } else {
        setError("Could not access microphone. Please check your device.")
      }
      return false
    }
  }, [])

  return { hasPermission, permissionState, requestPermission, error }
}
