"use client"

import { useState } from "react"
import { createBrowserSupabaseClient } from "@/lib/supabase-browser"
import { Button } from "@/components/ui/button"

export default function CheckImages() {
  const [results, setResults] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)

  const checkImage = async (bucket: string, path: string) => {
    try {
      const supabase = createBrowserSupabaseClient()

      // Try to get the public URL
      const { data: urlData } = await supabase.storage.from(bucket).getPublicUrl(path)

      // Check if the bucket exists
      const { data: buckets } = await supabase.storage.listBuckets()
      const bucketExists = buckets?.some((b) => b.name === bucket) || false

      // Try to list files in the bucket
      const { data: files, error: listError } = await supabase.storage.from(bucket).list()

      return {
        bucketExists,
        fileCount: files?.length || 0,
        files: files?.map((f) => f.name).join(", "),
        publicUrl: urlData?.publicUrl || null,
        listError: listError ? listError.message : null,
      }
    } catch (error: any) {
      return {
        error: error.message,
      }
    }
  }

  const runCheck = async () => {
    setLoading(true)
    try {
      const imagesBucket = await checkImage("images", "")
      const rumiLogo = await checkImage("images", "rumi_logo.png")
      const feelingAgent = await checkImage("images", "feeling_agent.png")

      setResults({
        imagesBucket,
        rumiLogo,
        feelingAgent,
      })
    } catch (error: any) {
      setResults({
        error: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 bg-gray-900 rounded-lg mt-4">
      <h2 className="text-xl font-bold text-yellow-400 mb-4">Image Checker</h2>

      <Button onClick={runCheck} disabled={loading} className="bg-yellow-400 text-black hover:bg-yellow-300 mb-4">
        {loading ? "Checking..." : "Check Images"}
      </Button>

      {Object.keys(results).length > 0 && (
        <div className="mt-4 space-y-4">
          <h3 className="text-lg font-semibold text-white">Results:</h3>
          <pre className="bg-gray-800 p-4 rounded overflow-auto text-xs text-gray-300">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
