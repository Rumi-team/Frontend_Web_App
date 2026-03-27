"use client"

import { useState, useEffect } from "react"

interface TeachingCardProps {
  concept: string
  imageUrl: string
  altText: string
  isActive: boolean
  onTimeout?: () => void
}

export function TeachingCard({
  concept,
  imageUrl,
  altText,
  isActive,
  onTimeout,
}: TeachingCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  // Auto-dismiss after 60s if teaching_complete never arrives
  useEffect(() => {
    if (!isActive) return
    const timer = setTimeout(() => {
      onTimeout?.()
    }, 60000)
    return () => clearTimeout(timer)
  }, [isActive, onTimeout])

  return (
    <div
      className={`
        absolute inset-0 z-30 flex flex-col items-center justify-center
        transition-opacity duration-700 ease-in-out
        ${isActive ? "opacity-100" : "opacity-0 pointer-events-none"}
      `}
      style={{ background: "rgba(0, 0, 0, 0.85)" }}
    >
      {/* Concept image */}
      <div className="relative w-full max-w-sm mx-auto px-6">
        <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="w-8 h-8 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
            </div>
          )}
          <img
            src={imageUrl}
            alt={altText}
            className={`
              w-full h-full object-cover transition-opacity duration-500
              ${imageLoaded ? "opacity-100" : "opacity-0"}
            `}
            onLoad={() => setImageLoaded(true)}
          />
        </div>

        {/* Concept name overlay */}
        <p
          className="mt-4 text-center font-bold text-lg tracking-wide"
          style={{ color: "rgb(255, 212, 26)" }}
        >
          {concept}
        </p>
      </div>
    </div>
  )
}
