"use client"

import { useState, useEffect } from "react"
import { createBrowserSupabaseClient } from "@/lib/supabase-browser"
import Image from "next/image"
import { ImageIcon } from "lucide-react"

interface SupabaseClientImageProps {
  bucket: string
  path: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
}

export function SupabaseClientImage({
  bucket,
  path,
  alt,
  width,
  height,
  className,
  priority = false,
}: SupabaseClientImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        const supabase = createBrowserSupabaseClient()
        const { data } = await supabase.storage.from(bucket).getPublicUrl(path)

        if (data && data.publicUrl) {
          setImageUrl(data.publicUrl)
        } else {
          setError(true)
        }
      } catch (e) {
        console.error("Error fetching image URL:", e)
        setError(true)
      }
    }

    fetchImageUrl()
  }, [bucket, path])

  if (error || !imageUrl) {
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
