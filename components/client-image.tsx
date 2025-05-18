"use client"

import { useState } from "react"
import Image from "next/image"
import { ImageIcon } from "lucide-react"

interface ClientImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
}

export function ClientImage({ src, alt, width, height, className, priority = false }: ClientImageProps) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className={`bg-gray-900 flex items-center justify-center rounded-lg ${className}`} style={{ width, height }}>
        <div className="text-center">
          <ImageIcon className="h-10 w-10 text-yellow-400 mx-auto mb-2" />
          <p className="text-gray-300 text-sm">{alt}</p>
        </div>
      </div>
    )
  }

  return (
    <Image
      src={src || "/placeholder.svg"}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      onError={() => setError(true)}
    />
  )
}
