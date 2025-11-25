"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createBrowserSupabaseClient } from "@/lib/supabase-browser"
import { SupabaseImage } from "@/components/supabase-image"
import CheckImages from "@/app/check-images"

export default function DebugPage() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [bucket, setBucket] = useState("images")
  const [path, setPath] = useState("rumi_logo.png")

  const checkSupabaseConfig = async () => {
    setLoading(true)
    try {
      const supabase = createBrowserSupabaseClient()

      // Check if we can connect to Supabase
      const { data: authData, error: authError } = await supabase.auth.getSession()

      // Check if we can access storage
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

      setResults({
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "Not available",
        authData: authData || null,
        authError: authError ? authError.message : null,
        buckets: buckets || [],
        bucketsError: bucketsError ? bucketsError.message : null,
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
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-yellow-400">Rumi Debug Page</h1>
          <Link href="/">
            <Button
              variant="outline"
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
            >
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="grid gap-8">
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-yellow-400 mb-4">Supabase Configuration</h2>
            <Button
              onClick={checkSupabaseConfig}
              disabled={loading}
              className="bg-yellow-400 text-black hover:bg-yellow-300 mb-4"
            >
              {loading ? "Checking..." : "Check Supabase Config"}
            </Button>

            {results && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-white mb-2">Results:</h3>
                <pre className="bg-gray-800 p-4 rounded overflow-auto text-xs text-gray-300">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <CheckImages />

          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-yellow-400 mb-4">Test Image Display</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Bucket</label>
                <input
                  type="text"
                  value={bucket}
                  onChange={(e) => setBucket(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Path</label>
                <input
                  type="text"
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                />
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Image Preview:</h3>
              <div className="flex justify-center bg-gray-800 p-4 rounded-lg">
                <SupabaseImage
                  bucket={bucket}
                  path={path}
                  alt="Test Image"
                  width={300}
                  height={200}
                  className="max-h-[300px] w-auto object-contain"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-yellow-400 mb-4">Required Images</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Rumi Logo:</h3>
                <div className="bg-gray-800 p-4 rounded-lg flex justify-center">
                  <SupabaseImage
                    bucket="images"
                    path="rumi_logo.png"
                    alt="Rumi Logo"
                    width={150}
                    height={50}
                    className="h-12 w-auto"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Feeling Agent:</h3>
                <div className="bg-gray-800 p-4 rounded-lg flex justify-center">
                  <SupabaseImage
                    bucket="images"
                    path="feeling_agent.png"
                    alt="Feeling Agent"
                    width={200}
                    height={300}
                    className="max-h-[200px] w-auto object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
