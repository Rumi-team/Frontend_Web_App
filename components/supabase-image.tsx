"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ImageIcon } from "lucide-react"
import { createBrowserSupabaseClient } from "@/lib/supabase-browser"

// Base64 encoded placeholder images
const PLACEHOLDER_IMAGES = {
  rumiLogo:
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCAyMDAgNTAiPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iNTAiIGZpbGw9IiMxMTExMTEiLz48dGV4dCB4PSIxMDAiIHk9IjI1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiNmYWNjMTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIj5SVU1JPC90ZXh0Pjwvc3ZnPg==",
  feelingAgent:
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iOTAwIiB2aWV3Qm94PSIwIDAgNTAwIDkwMCI+PHJlY3Qgd2lkdGg9IjUwMCIgaGVpZ2h0PSI5MDAiIGZpbGw9IiMxMTExMTEiLz48cmVjdCB4PSI1MCIgeT0iMTAwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjcwMCIgcng9IjIwIiByeT0iMjAiIGZpbGw9IiMyMjIyMjIiIHN0cm9rZT0iI2ZhY2MxNSIgc3Ryb2tlLXdpZHRoPSI0Ii8+PHRleHQgeD0iMjUwIiB5PSI0NTAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZhY2MxNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgYWxpZ25tZW50LWJhc2VsaW5lPSJtaWRkbGUiPkZlZWxpbmcgQWdlbnQ8L3RleHQ+PC9zdmc+",
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

  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        setLoading(true)
        setError(false)

        // Get fallback image based on type
        let fallbackImage = ""
        if (fallbackType === "rumi_logo") {
          fallbackImage = PLACEHOLDER_IMAGES.rumiLogo
        } else if (fallbackType === "feeling_agent") {
          fallbackImage = PLACEHOLDER_IMAGES.feelingAgent
        }

        const supabase = createBrowserSupabaseClient()

        // First check if the bucket exists
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

        if (bucketsError) {
          console.error("Error listing buckets:", bucketsError)
          setImageUrl(fallbackImage)
          setError(true)
          return
        }

        const bucketExists = buckets.some((b) => b.name === bucket)
        if (!bucketExists) {
          console.error(`Bucket "${bucket}" does not exist`)
          setImageUrl(fallbackImage)
          setError(true)
          return
        }

        // Check if the file exists
        const { data: files, error: listError } = await supabase.storage.from(bucket).list("", {
          limit: 100,
          offset: 0,
          sortBy: { column: "name", order: "asc" },
        })

        if (listError) {
          console.error("Error listing files:", listError)
          setImageUrl(fallbackImage)
          setError(true)
          return
        }

        const fileExists = files.some((file) => file.name === path)
        if (!fileExists && path !== "") {
          console.error(`File "${path}" does not exist in bucket "${bucket}"`)
          console.log(
            "Available files:",
            files.map((f) => f.name),
          )
          setImageUrl(fallbackImage)
          setError(true)
          return
        }

        // Get the public URL
        const { data } = await supabase.storage.from(bucket).getPublicUrl(path)

        if (data && data.publicUrl) {
          console.log(`Image URL fetched successfully: ${data.publicUrl}`)
          setImageUrl(data.publicUrl)
        } else {
          console.error("No public URL returned from Supabase")
          setImageUrl(fallbackImage)
          setError(true)
        }
      } catch (e) {
        console.error(`Error fetching image URL for ${bucket}/${path}:`, e)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchImageUrl()
  }, [bucket, path, fallbackType])

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
    // Use fallback image if available, otherwise show placeholder
    if (fallbackType === "rumi_logo" && PLACEHOLDER_IMAGES.rumiLogo) {
      return (
        <Image
          src={PLACEHOLDER_IMAGES.rumiLogo || "/placeholder.svg"}
          alt={alt}
          width={width}
          height={height}
          className={className}
        />
      )
    } else if (fallbackType === "feeling_agent" && PLACEHOLDER_IMAGES.feelingAgent) {
      return (
        <Image
          src={PLACEHOLDER_IMAGES.feelingAgent || "/placeholder.svg"}
          alt={alt}
          width={width}
          height={height}
          className={className}
        />
      )
    }

    return (
      <div className={`bg-gray-900 flex items-center justify-center rounded-lg ${className}`} style={{ width, height }}>
        <div className="text-center">
          <ImageIcon className="h-10 w-10 text-yellow-400 mx-auto mb-2" />
          <p className="text-gray-300 text-sm">{alt}</p>
          <p className="text-gray-500 text-xs mt-2">{`${bucket}/${path}`}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <Image
        src={imageUrl || "/placeholder.svg"}
        alt={alt}
        width={width}
        height={height}
        className={className}
        priority={priority}
        onError={() => {
          console.error(`Image failed to load: ${imageUrl}`)
          setError(true)
        }}
      />
    </div>
  )
}
