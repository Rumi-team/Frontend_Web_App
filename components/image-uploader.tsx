"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createBrowserSupabaseClient } from "@/lib/supabase-browser"
import { Upload, Check, AlertCircle } from "lucide-react"

interface ImageUploaderProps {
  bucket: string
  path: string
  onSuccess?: () => void
}

export function ImageUploader({ bucket, path, onSuccess }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }

    const file = e.target.files[0]
    setUploading(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createBrowserSupabaseClient()

      // Check if bucket exists
      const { data: buckets } = await supabase.storage.listBuckets()
      const bucketExists = buckets?.some((b) => b.name === bucket)

      if (!bucketExists) {
        // Create bucket if it doesn't exist
        const { error: createError } = await supabase.storage.createBucket(bucket, {
          public: true,
        })

        if (createError) {
          throw new Error(`Failed to create bucket: ${createError.message}`)
        }
      }

      // Upload the file
      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      })

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      // Make the bucket public if it's not already
      await supabase.storage.updateBucket(bucket, {
        public: true,
      })

      setSuccess(true)
      if (onSuccess) onSuccess()
    } catch (err: any) {
      console.error("Error uploading image:", err)
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2">
        <label className="relative cursor-pointer">
          <input type="file" accept="image/*" className="sr-only" onChange={handleUpload} disabled={uploading} />
          <Button
            type="button"
            className="bg-yellow-400 text-black hover:bg-yellow-300 flex items-center gap-2"
            disabled={uploading}
          >
            {uploading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload size={16} />
                Upload Image
              </>
            )}
          </Button>
        </label>
      </div>

      {error && (
        <div className="mt-2 text-red-500 text-sm flex items-center gap-1">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {success && (
        <div className="mt-2 text-green-500 text-sm flex items-center gap-1">
          <Check size={14} />
          Image uploaded successfully!
        </div>
      )}
    </div>
  )
}
