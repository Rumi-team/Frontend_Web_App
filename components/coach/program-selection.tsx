"use client"

import { useState } from "react"
import type { Room } from "livekit-client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface ProgramSelectionProps {
  programs: string[]
  room: Room | null
}

export function ProgramSelection({ programs, room }: ProgramSelectionProps) {
  const [selecting, setSelecting] = useState<string | null>(null)

  async function handleSelect(program: string) {
    if (!room || selecting) return
    setSelecting(program)

    try {
      const payload = JSON.stringify({
        type: "program_selection",
        program,
        request_id: crypto.randomUUID(),
      })

      const encoder = new TextEncoder()
      await room.localParticipant.publishData(encoder.encode(payload), {
        topic: "rumi.control",
        reliable: true,
      })
    } catch (err) {
      console.error("Failed to send program selection:", err)
      setSelecting(null)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg space-y-4">
        <h2 className="text-center text-xl font-semibold text-white">
          Choose Your Program
        </h2>
        <p className="text-center text-sm text-gray-400">
          Select a coaching program to begin
        </p>

        <div className="space-y-3">
          {programs.map((program) => (
            <Card
              key={program}
              onClick={() => handleSelect(program)}
              className={`cursor-pointer border-gray-700 bg-gray-900 p-4 transition-all hover:border-yellow-400 ${
                selecting === program ? "border-yellow-400 opacity-70" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-white">{program}</span>
                {selecting === program && (
                  <Loader2 className="h-4 w-4 animate-spin text-yellow-400" />
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
