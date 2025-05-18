"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Check, AlertCircle, Upload } from "lucide-react"
import { FallbackImage } from "@/components/fallback-image"
import { checkImagesBucket, checkImageExists, createImagesBucket } from "@/app/actions/storage-actions"
import { createBrowserSupabaseClient } from "@/lib/supabase-browser"
import Image from "next/image"

export default function SetupPage() {
  const [bucketStatus, setBucketStatus] = useState<{ exists: boolean; checking: boolean }>({
    exists: false,
    checking: true,
  })
  const [logoStatus, setLogoStatus] = useState<{ exists: boolean; checking: boolean }>({
    exists: false,
    checking: true,
  })
  const [agentStatus, setAgentStatus] = useState<{ exists: boolean; checking: boolean }>({
    exists: false,
    checking: true,
  })
  const [uploading, setUploading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [creatingBucket, setCreatingBucket] = useState(false)

  // Check bucket and image status
  useEffect(() => {
    const checkStatus = async () => {
      // Check if bucket exists
      const bucketResult = await checkImagesBucket()
      setBucketStatus({ exists: bucketResult.exists, checking: false })

      if (bucketResult.exists) {
        // Check if logo exists
        const logoResult = await checkImageExists("rumi_logo.png")
        setLogoStatus({ exists: logoResult.exists, checking: false })

        // Check if feeling agent exists
        const agentResult = await checkImageExists("feeling_agent.png")
        setAgentStatus({ exists: agentResult.exists, checking: false })
      } else {
        setLogoStatus({ exists: false, checking: false })
        setAgentStatus({ exists: false, checking: false })
      }
    }

    checkStatus()
  }, [])

  const handleCreateBucket = async () => {
    setCreatingBucket(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await createImagesBucket()

      if (result.success) {
        setBucketStatus({ exists: true, checking: false })
        setSuccess("Images bucket created successfully!")
      } else {
        setError(result.error || "Failed to create bucket")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCreatingBucket(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, fileName: string) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }

    const file = e.target.files[0]
    setUploading(fileName)
    setError(null)
    setSuccess(null)

    try {
      // First ensure the bucket exists
      if (!bucketStatus.exists) {
        const bucketResult = await createImagesBucket()
        if (!bucketResult.success) {
          throw new Error(`Failed to create bucket: ${bucketResult.error}`)
        }
        setBucketStatus({ exists: true, checking: false })
      }

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

      // Update status
      if (fileName === "rumi_logo.png") {
        setLogoStatus({ exists: true, checking: false })
      } else if (fileName === "feeling_agent.png") {
        setAgentStatus({ exists: true, checking: false })
      }
    } catch (err: any) {
      console.error("Error uploading image:", err)
      setError(err.message)
    } finally {
      setUploading(null)
    }
  }

  const refreshStatus = async () => {
    setBucketStatus({ ...bucketStatus, checking: true })
    setLogoStatus({ ...logoStatus, checking: true })
    setAgentStatus({ ...agentStatus, checking: true })

    // Check if bucket exists
    const bucketResult = await checkImagesBucket()
    setBucketStatus({ exists: bucketResult.exists, checking: false })

    if (bucketResult.exists) {
      // Check if logo exists
      const logoResult = await checkImageExists("rumi_logo.png")
      setLogoStatus({ exists: logoResult.exists, checking: false })

      // Check if feeling agent exists
      const agentResult = await checkImageExists("feeling_agent.png")
      setAgentStatus({ exists: agentResult.exists, checking: false })
    } else {
      setLogoStatus({ exists: false, checking: false })
      setAgentStatus({ exists: false, checking: false })
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-yellow-400">Rumi Setup Guide</h1>
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
            <CardTitle className="text-xl md:text-2xl text-yellow-400">Storage Setup</CardTitle>
            <CardDescription className="text-gray-300 text-base md:text-lg">
              Follow these steps to set up image storage for your Rumi website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                {bucketStatus.checking ? (
                  <div className="w-6 h-6 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin" />
                ) : bucketStatus.exists ? (
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <Check size={14} className="text-black" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs">
                    1
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <h3 className="text-lg md:text-xl font-medium text-white">Create the "images" bucket in Supabase</h3>
                <p className="text-gray-400 text-base md:text-lg mt-1 mb-3">
                  You need to create a storage bucket named "images" in your Supabase project.
                </p>

                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                  <p className="text-gray-300 text-base mb-4">
                    You can create the bucket automatically by clicking the button below, or manually through the
                    Supabase dashboard.
                  </p>
                  <Button
                    onClick={handleCreateBucket}
                    className="bg-yellow-400 text-black hover:bg-yellow-300 mr-4"
                    disabled={bucketStatus.exists || creatingBucket}
                  >
                    {creatingBucket ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full mr-2"></div>
                        Creating Bucket...
                      </>
                    ) : bucketStatus.exists ? (
                      "Bucket Already Exists"
                    ) : (
                      "Create Images Bucket"
                    )}
                  </Button>

                  <Button onClick={refreshStatus} className="bg-gray-700 hover:bg-gray-600 text-white text-base">
                    Check Status
                  </Button>
                </div>

                {bucketStatus.exists && (
                  <div className="mt-2 text-green-500 text-base md:text-lg flex items-center">
                    <Check size={16} className="mr-1" />
                    Bucket "images" exists!
                  </div>
                )}
              </div>
            </div>

            {bucketStatus.exists && (
              <>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {logoStatus.checking ? (
                      <div className="w-6 h-6 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin" />
                    ) : logoStatus.exists ? (
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                        <Check size={14} className="text-black" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs">
                        2
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg md:text-xl font-medium text-white">Upload Rumi Logo</h3>
                    <p className="text-gray-400 text-base md:text-lg mt-1 mb-3">
                      Upload your logo image as "rumi_logo.png"
                    </p>

                    <div className="bg-gray-800 p-4 rounded-lg mb-4 flex justify-center">
                      <Image
                        src="/rumi_logo.png"
                        alt="Rumi Logo"
                        width={607}
                        height={202}
                        className="h-[48.6px] w-auto object-contain"
                      />
                    </div>

                    <label className="relative cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => handleUpload(e, "rumi_logo.png")}
                        disabled={uploading !== null}
                      />
                      <Button
                        type="button"
                        className="bg-yellow-400 text-black hover:bg-yellow-300 flex items-center gap-2 text-base"
                        disabled={uploading !== null}
                      >
                        {uploading === "rumi_logo.png" ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload size={16} />
                            Upload Logo
                          </>
                        )}
                      </Button>
                    </label>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {agentStatus.checking ? (
                      <div className="w-6 h-6 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin" />
                    ) : agentStatus.exists ? (
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                        <Check size={14} className="text-black" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs">
                        3
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg md:text-xl font-medium text-white">Upload Feeling Agent</h3>
                    <p className="text-gray-400 text-base md:text-lg mt-1 mb-3">
                      Upload your feeling agent image as "feeling_agent.png"
                    </p>

                    <div className="bg-gray-800 p-4 rounded-lg mb-4 flex justify-center">
                      <FallbackImage
                        type="feeling_agent"
                        alt="Feeling Agent"
                        width={300}
                        height={540}
                        className="h-64 w-auto object-contain"
                        trySupabase={false}
                      />
                    </div>

                    <label className="relative cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => handleUpload(e, "feeling_agent.png")}
                        disabled={uploading !== null}
                      />
                      <Button
                        type="button"
                        className="bg-yellow-400 text-black hover:bg-yellow-300 flex items-center gap-2 text-base"
                        disabled={uploading !== null}
                      >
                        {uploading === "feeling_agent.png" ? (
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
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="mt-4 text-red-500 text-base md:text-lg flex items-center gap-1 p-3 bg-red-950 bg-opacity-30 rounded border border-red-800">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {success && (
              <div className="mt-4 text-green-500 text-base md:text-lg flex items-center gap-1 p-3 bg-green-950 bg-opacity-30 rounded border border-green-800">
                <Check size={16} />
                {success}
              </div>
            )}

            {bucketStatus.exists && logoStatus.exists && agentStatus.exists && (
              <div className="mt-6 p-4 bg-green-900 bg-opacity-20 border border-green-800 rounded-lg">
                <h3 className="text-lg md:text-xl font-medium text-green-400 flex items-center">
                  <Check size={20} className="mr-2" />
                  Setup Complete!
                </h3>
                <p className="text-gray-300 text-base md:text-lg mt-2">
                  Your images are now properly configured. You can return to the home page to see your real images.
                </p>
                <Link href="/">
                  <Button className="mt-4 bg-green-600 hover:bg-green-700 text-white text-base">Go to Homepage</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
