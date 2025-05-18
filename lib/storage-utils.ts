"use server"

import { createServerSupabaseClient } from "./supabase"

export async function ensureStorageBucket(bucketName: string) {
  try {
    const supabase = createServerSupabaseClient()

    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some((bucket) => bucket.name === bucketName)

    if (!bucketExists) {
      // Create the bucket if it doesn't exist
      const { data, error } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      })

      if (error) {
        console.error("Error creating bucket:", error)
        return { success: false, error: error.message }
      }

      console.log(`Bucket ${bucketName} created successfully`)
      return { success: true, created: true }
    }

    // Update bucket to be public
    const { error } = await supabase.storage.updateBucket(bucketName, {
      public: true,
    })

    if (error) {
      console.error("Error updating bucket:", error)
      return { success: false, error: error.message }
    }

    return { success: true, created: false }
  } catch (error: any) {
    console.error("Error ensuring bucket exists:", error)
    return { success: false, error: error.message }
  }
}

export async function getPublicImageUrl(bucketName: string, path: string) {
  try {
    const supabase = createServerSupabaseClient()
    const { data } = await supabase.storage.from(bucketName).getPublicUrl(path)
    return data.publicUrl
  } catch (error) {
    console.error("Error getting public URL:", error)
    return null
  }
}
