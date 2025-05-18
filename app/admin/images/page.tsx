"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createBrowserSupabaseClient } from "@/lib/supabase-browser"
import { SupabaseImage } from "@/components/supabase-image"
import { ImageUploader } from "@/components/image-uploader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, ArrowLeft } from "lucide-react"

export default function ImagesPage() {
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true)
      setError(null)
      try {
        const supabase = createBrowserSupabaseClient()

        // Check if bucket exists
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

        if (bucketsError) {
          throw new Error(`Failed to list buckets: ${bucketsError.message}`)
        }

        const bucketExists = buckets.some((b) => b.name === "images")

        if (!bucketExists) {
          setFiles([])
          return
        }

        // List files in the bucket
        const { data, error: listError } = await supabase.storage.from("images").list()

        if (listError) {
          throw new Error(`Failed to list files: ${listError.message}`)
        }

        setFiles(data || [])
      } catch (err: any) {
        console.error("Error fetching files:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchFiles()
  }, [refreshKey])

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-yellow-400">Image Management</h1>
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              <span className="ml-2">Refresh</span>
            </Button>
            <Link href="/">
              <Button
                variant="outline"
                className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
              >
                <ArrowLeft size={16} />
                <span className="ml-2">Back to Home</span>
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-xl text-yellow-400">Required Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Rumi Logo</h3>
                  <div className="bg-gray-800 p-4 rounded-lg flex justify-center items-center h-[150px]">
                    <SupabaseImage
                      bucket="images"
                      path="rumi_logo.png"
                      alt="Rumi Logo"
                      width={150}
                      height={50}
                      className="h-12 w-auto"
                      fallbackType="rumi_logo"
                    />
                  </div>
                  <ImageUploader bucket="images" path="rumi_logo.png" onSuccess={handleRefresh} />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Feeling Agent</h3>
                  <div className="bg-gray-800 p-4 rounded-lg flex justify-center items-center h-[150px]">
                    <SupabaseImage
                      bucket="images"
                      path="feeling_agent.png"
                      alt="Feeling Agent"
                      width={200}
                      height={300}
                      className="max-h-[120px] w-auto object-contain"
                      fallbackType="feeling_agent"
                    />
                  </div>
                  <ImageUploader bucket="images" path="feeling_agent.png" onSuccess={handleRefresh} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-xl text-yellow-400">All Images in Storage</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading images...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  <p>Error: {error}</p>
                </div>
              ) : files.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>No images found in storage.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {files.map((file) => (
                    <div key={file.id} className="bg-gray-800 p-2 rounded-lg">
                      <div className="aspect-square flex items-center justify-center bg-gray-900 rounded mb-2">
                        <SupabaseImage
                          bucket="images"
                          path={file.name}
                          alt={file.name}
                          width={100}
                          height={100}
                          className="max-h-[100px] max-w-full object-contain"
                        />
                      </div>
                      <p className="text-xs text-gray-300 truncate">{file.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
