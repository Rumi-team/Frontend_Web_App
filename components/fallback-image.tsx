"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import { ImageIcon } from "lucide-react"
import { createBrowserSupabaseClient } from "@/lib/supabase-browser"

// Base64 encoded placeholder images
const PLACEHOLDER_IMAGES = {
  rumiLogo:
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI5MDAiIGhlaWdodD0iMjI1IiB2aWV3Qm94PSIwIDAgOTAwIDIyNSI+PHJlY3Qgd2lkdGg9IjkwMCIgaGVpZ2h0PSIyMjUiIGZpbGw9IiMxMTExMTEiLz48dGV4dCB4PSI0NTAiIHk9IjExMi41IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTA4IiBmaWxsPSIjZmFjYzE1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSI+UlVNSTwvdGV4dD48L3N2Zz4=",
  feelingAgent:
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI5MDAiIGhlaWdodD0iMTYyMCIgdmlld0JveD0iMCAwIDkwMCAxNjIwIj48cmVjdCB3aWR0aD0iOTAwIiBoZWlnaHQ9IjE2MjAiIGZpbGw9IiMxMTExMTEiLz48cmVjdCB4PSI5MCIgeT0iMTgwIiB3aWR0aD0iNzIwIiBoZWlnaHQ9IjEyNjAiIHJ4PSIzNiIgcnk9IjM2IiBmaWxsPSIjMjIyMjIyIiBzdHJva2U9IiNmYWNjMTUiIHN0cm9rZS13aWR0aD0iOCIvPjx0ZXh0IHg9IjQ1MCIgeT0iODEwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IiNmYWNjMTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIj5GZWVsaW5nIEFnZW50PC90ZXh0Pjwvc3ZnPg==",
}

interface FallbackImageProps {
  type: "rumi_logo" | "feeling_agent" | "generic"
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  trySupabase?: boolean
}

export function FallbackImage({
  type,
  alt,
  width,
  height,
  className,
  priority = false,
  trySupabase = true,
}: FallbackImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(trySupabase)
  const [error, setError] = useState(false)

  // Get the fallback image based on type
  const fallbackSrc =
    type === "rumi_logo"
      ? PLACEHOLDER_IMAGES.rumiLogo
      : type === "feeling_agent"
        ? PLACEHOLDER_IMAGES.feelingAgent
        : null

  // Try to get the image from Supabase if requested
  useEffect(() => {
    if (!trySupabase) return

    const fetchImage = async () => {
      try {
        const supabase = createBrowserSupabaseClient()
        const imagePath = type === "rumi_logo" ? "rumi_logo.png" : "feeling_agent.png"

        // Try to get the public URL
        const { data } = await supabase.storage.from("images").getPublicUrl(imagePath)

        if (data?.publicUrl) {
          // Check if the image actually exists by making a HEAD request
          const response = await fetch(data.publicUrl, { method: "HEAD" }).catch(() => null)

          if (response && response.ok) {
            setImageUrl(data.publicUrl)
          } else {
            setError(true)
          }
        } else {
          setError(true)
        }
      } catch (err) {
        console.error(`Error fetching ${type} image:`, err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchImage()
  }, [type, trySupabase])

  // Show loading state
  if (loading) {
    return (
      <div
        className={`bg-gray-900 flex items-center justify-center rounded-lg animate-pulse ${className}`}
        style={{ width, height }}
      >
        <div className="text-center">
          <ImageIcon className="h-20 w-20 text-gray-700 mx-auto mb-2" />
          <p className="text-gray-600 text-xl">Loading...</p>
        </div>
      </div>
    )
  }

  // If we have a Supabase image, use it
  if (imageUrl && !error) {
    return (
      <Image
        src={imageUrl || "/placeholder.svg"}
        alt={alt}
        width={width}
        height={height}
        className={className}
        priority={priority}
        onError={() => setError(true)}
      />
    )
  }

  // Otherwise use the fallback
  if (!fallbackSrc) {
    return (
      <div className={`bg-gray-900 flex items-center justify-center rounded-lg ${className}`} style={{ width, height }}>
        <div className="text-center">
          <ImageIcon className="h-20 w-20 text-yellow-400 mx-auto mb-2" />
          <p className="text-gray-300 text-xl">{alt}</p>
        </div>
      </div>
    )
  }

  return (
    <Image
      src={fallbackSrc || "/placeholder.svg"}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  )
}
