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

interface SupabaseImageProps {
  bucket: string
  path: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  fallbackType?: "rumi_logo" | "feeling_agent" | "generic"
}

export function SupabaseImage({
  bucket,
  path,
  alt,
  width,
  height,
  className,
  priority = false,
  fallbackType = "generic",
}: SupabaseImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  // Get fallback image based on type
  const getFallbackImage = () => {
    if (fallbackType === "rumi_logo") {
      return PLACEHOLDER_IMAGES.rumiLogo
    } else if (fallbackType === "feeling_agent") {
      return PLACEHOLDER_IMAGES.feelingAgent
    }
    return null
  }

  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        setLoading(true)
        setError(false)

        const supabase = createBrowserSupabaseClient()

        // Try to get the public URL directly without checking bucket existence
        // This simplifies the process and reduces potential error points
        const { data } = await supabase.storage.from(bucket).getPublicUrl(path)

        if (data && data.publicUrl) {
          // Verify the image exists by making a HEAD request
          try {
            const response = await fetch(data.publicUrl, { method: "HEAD" })
            if (response.ok) {
              setImageUrl(data.publicUrl)
              return
            }
          } catch (e) {
            // If HEAD request fails, we'll fall back to placeholder
            console.log("Image verification failed, using fallback")
          }
        }

        // If we get here, either the bucket doesn't exist or the image doesn't exist
        // We'll use the fallback image
        setError(true)
      } catch (e) {
        console.log(`Using fallback for ${bucket}/${path}`)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchImageUrl()
  }, [bucket, path])

  if (loading) {
    return (
      <div
        className={`bg-gray-900 flex items-center justify-center rounded-lg animate-pulse ${className}`}
        style={{ width, height }}
      >
        <div className="text-center">
          <ImageIcon className="h-10 w-10 text-gray-700 mx-auto mb-2" />
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !imageUrl) {
    const fallbackImage = getFallbackImage()
    if (fallbackImage) {
      return (
        <Image
          src={fallbackImage || "/placeholder.svg"}
          alt={alt}
          width={width}
          height={height}
          className={className}
          priority={priority}
        />
      )
    }

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

export default SupabaseImage
