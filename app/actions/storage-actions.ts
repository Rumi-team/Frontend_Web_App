"use server"

import { createServerSupabaseClient } from "@/lib/supabase"

export async function checkImagesBucket() {
  try {
    const supabase = createServerSupabaseClient()

    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error("Error listing buckets:", listError)
      return { exists: false, error: listError.message }
    }

    const bucketExists = buckets.some((bucket) => bucket.name === "images")
    return { exists: bucketExists }
  } catch (error: any) {
    console.error("Error checking bucket:", error)
    return { exists: false, error: error.message }
  }
}

export async function checkImageExists(path: string) {
  try {
    const supabase = createServerSupabaseClient()

    // First check if the bucket exists
    const { exists: bucketExists } = await checkImagesBucket()

    if (!bucketExists) {
      return { exists: false, reason: "bucket_missing" }
    }

    // Check if the file exists by listing files
    const { data: files, error: listError } = await supabase.storage.from("images").list()

    if (listError) {
      console.error("Error listing files:", listError)
      return { exists: false, error: listError.message }
    }

    const fileExists = files.some((file) => file.name === path)
    return { exists: fileExists }
  } catch (error: any) {
    console.error("Error checking image:", error)
    return { exists: false, error: error.message }
  }
}

export async function createImagesBucket() {
  try {
    const supabase = createServerSupabaseClient()

    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some((bucket) => bucket.name === "images")

    if (!bucketExists) {
      // Create the bucket if it doesn't exist
      const { error } = await supabase.storage.createBucket("images", {
        public: true,
      })

      if (error) {
        console.error("Error creating bucket:", error)
        return { success: false, error: error.message }
      }

      console.log(`Bucket images created successfully`)
      return { success: true, created: true }
    }

    return { success: true, created: false }
  } catch (error: any) {
    console.error("Error ensuring bucket exists:", error)
    return { success: false, error: error.message }
  }
}
