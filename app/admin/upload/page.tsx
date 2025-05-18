"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createBrowserSupabaseClient } from "@/lib/supabase-browser"
import Link from "next/link"
import { ArrowLeft, Upload, Check, AlertCircle } from "lucide-react"
import { FallbackImage } from "@/components/fallback-image"
import { createImagesBucket } from "@/app/actions/storage-actions"

export default function UploadPage() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [bucketCreated, setBucketCreated] = useState(false)

  const createBucket = async () => {
    try {
      const result = await createImagesBucket()
      if (result.success) {
        setBucketCreated(true)
        setSuccess("Images bucket created successfully!")
      } else {
        setError(`Failed to create bucket: ${result.error}`)
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, fileName: string) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }

    const file = e.target.files[0]
    setUploading(true)
    setError(null)
    setSuccess(null)

    try {
      // First ensure the bucket exists
      await createImagesBucket()

      const supabase = createBrowserSupabaseClient()

      // Upload the file
      const { error: uploadError } = await supabase.storage.from("images").upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      })

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      setSuccess(`${fileName} uploaded successfully!`)
    } catch (err: any) {
      console.error("Error uploading image:", err)
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-yellow-400">Upload Images</h1>
          <Link href="/">
            <Button
              variant="outline"
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <Card className="bg-gray-900 border-gray-800 mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-yellow-400">Create Images Bucket</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              First, you need to create the "images" bucket in your Supabase storage. Click the button below to create
              it:
            </p>
            <Button
              onClick={createBucket}
              className="bg-yellow-400 text-black hover:bg-yellow-300"
              disabled={bucketCreated}
            >
              {bucketCreated ? "Bucket Created" : "Create Images Bucket"}
            </Button>

            {error && (
              <div className="mt-4 text-red-500 text-sm flex items-center gap-1 p-3 bg-red-950 bg-opacity-30 rounded border border-red-800">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {success && (
              <div className="mt-4 text-green-500 text-sm flex items-center gap-1 p-3 bg-green-950 bg-opacity-30 rounded border border-green-800">
                <Check size={16} />
                {success}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg text-yellow-400">Upload Rumi Logo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="bg-gray-800 p-4 rounded-lg mb-4 w-full flex justify-center">
                  <FallbackImage type="rumi_logo" alt="Rumi Logo" width={150} height={50} className="h-12 w-auto" />
                </div>
                <label className="relative cursor-pointer w-full">
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => handleUpload(e, "rumi_logo.png")}
                    disabled={uploading}
                  />
                  <Button
                    type="button"
                    className="bg-yellow-400 text-black hover:bg-yellow-300 w-full flex items-center justify-center gap-2"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        Upload Rumi Logo
                      </>
                    )}
                  </Button>
                </label>
                <p className="text-xs text-gray-400 mt-2">File name: rumi_logo.png</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg text-yellow-400">Upload Feeling Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="bg-gray-800 p-4 rounded-lg mb-4 w-full flex justify-center">
                  <FallbackImage
                    type="feeling_agent"
                    alt="Feeling Agent"
                    width={100}
                    height={180}
                    className="h-32 w-auto object-contain"
                  />
                </div>
                <label className="relative cursor-pointer w-full">
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => handleUpload(e, "feeling_agent.png")}
                    disabled={uploading}
                  />
                  <Button
                    type="button"
                    className="bg-yellow-400 text-black hover:bg-yellow-300 w-full flex items-center justify-center gap-2"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        Upload Feeling Agent
                      </>
                    )}
                  </Button>
                </label>
                <p className="text-xs text-gray-400 mt-2">File name: feeling_agent.png</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
