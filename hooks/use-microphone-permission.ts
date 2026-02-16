"use client"

import { useState, useCallback } from "react"

interface UseMicrophonePermissionReturn {
  hasPermission: boolean | null
  requestPermission: () => Promise<boolean>
  error: string | null
}

export function useMicrophonePermission(): UseMicrophonePermissionReturn {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Stop the test track immediately — LiveKit will create its own
      stream.getTracks().forEach((t) => t.stop())
      setHasPermission(true)
      setError(null)
      return true
    } catch (err) {
      setHasPermission(false)
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

  return { hasPermission, requestPermission, error }
}
