"use client"

import { useState, useRef, useCallback } from "react"
import { Room, RoomEvent, Track, type RemoteTrackPublication } from "livekit-client"
import type { ConnectionState, ConnectionDetails } from "@/lib/types/livekit"

interface UseLiveKitConnectionReturn {
  connectionState: ConnectionState
  room: Room | null
  isMicrophoneEnabled: boolean
  connect: (displayName?: string) => Promise<void>
  disconnect: () => Promise<void>
  toggleMicrophone: () => Promise<void>
  error: string | null
  remoteAudioTrack: MediaStreamTrack | null
}

export function useLiveKitConnection(): UseLiveKitConnectionReturn {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("disconnected")
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [remoteAudioTrack, setRemoteAudioTrack] =
    useState<MediaStreamTrack | null>(null)

  const roomRef = useRef<Room | null>(null)
  const [, setRoomVersion] = useState(0) // Force re-renders when room changes

  const connect = useCallback(async (displayName?: string) => {
    setConnectionState("connecting")
    setError(null)

    try {
      // Fetch connection details from our token API
      const res = await fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Failed to get connection details")
      }

      const details: ConnectionDetails = await res.json()

      // Create and connect the room
      const room = new Room({
        audioCaptureDefaults: { autoGainControl: true, noiseSuppression: true },
        adaptiveStream: true,
      })

      // Listen for remote audio tracks (the agent's voice)
      room.on(
        RoomEvent.TrackSubscribed,
        (track, publication: RemoteTrackPublication) => {
          if (track.kind === Track.Kind.Audio) {
            setRemoteAudioTrack(track.mediaStreamTrack)
          }
        }
      )

      room.on(RoomEvent.TrackUnsubscribed, (track) => {
        if (track.kind === Track.Kind.Audio) {
          setRemoteAudioTrack(null)
        }
      })

      room.on(RoomEvent.Disconnected, () => {
        setConnectionState("disconnected")
        setRemoteAudioTrack(null)
      })

      room.on(RoomEvent.Reconnecting, () => {
        setConnectionState("connecting")
      })

      room.on(RoomEvent.Reconnected, () => {
        setConnectionState("connected")
      })

      await room.connect(details.serverUrl, details.participantToken)

      // Enable microphone
      await room.localParticipant.setMicrophoneEnabled(true)
      setIsMicrophoneEnabled(true)

      roomRef.current = room
      setRoomVersion((v) => v + 1)
      setConnectionState("connected")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Connection failed"
      setError(message)
      setConnectionState("disconnected")
    }
  }, [])

  const disconnect = useCallback(async () => {
    const room = roomRef.current
    if (!room) return

    // Send farewell request before disconnecting
    try {
      await room.localParticipant.sendText(
        JSON.stringify({
          type: "farewell_request",
          request_id: crypto.randomUUID(),
        }),
        { topic: "rumi.control" }
      )
    } catch {
      // Best effort — disconnect anyway
    }

    // Don't disconnect immediately — let the save flow complete
    // The session-save-overlay will handle the actual disconnect
  }, [])

  const forceDisconnect = useCallback(async () => {
    const room = roomRef.current
    if (!room) return

    await room.disconnect()
    roomRef.current = null
    setRoomVersion((v) => v + 1)
    setConnectionState("disconnected")
    setRemoteAudioTrack(null)
    setIsMicrophoneEnabled(true)
  }, [])

  const toggleMicrophone = useCallback(async () => {
    const room = roomRef.current
    if (!room) return

    const newState = !isMicrophoneEnabled
    await room.localParticipant.setMicrophoneEnabled(newState)
    setIsMicrophoneEnabled(newState)
  }, [isMicrophoneEnabled])

  // Expose forceDisconnect via room ref custom property
  if (roomRef.current) {
    ;(roomRef.current as any).__forceDisconnect = forceDisconnect
  }

  return {
    connectionState,
    room: roomRef.current,
    isMicrophoneEnabled,
    connect,
    disconnect,
    toggleMicrophone,
    error,
    remoteAudioTrack,
  }
}
