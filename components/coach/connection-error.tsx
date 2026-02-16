"use client"

import { Button } from "@/components/ui/button"
import { AlertCircle, RotateCcw } from "lucide-react"

interface ConnectionErrorProps {
  message: string
  onRetry: () => void
}

export function ConnectionError({ message, onRetry }: ConnectionErrorProps) {
  return (
    <div className="flex flex-col items-center gap-4 text-center max-w-sm">
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
