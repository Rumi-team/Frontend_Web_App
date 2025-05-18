import { createServerSupabaseClient } from "./supabase"

export async function getImageUrl(bucket: string, path: string): Promise<string | null> {
  try {
    const supabase = createServerSupabaseClient()
    const { data } = await supabase.storage.from(bucket).getPublicUrl(path)

    if (data && data.publicUrl) {
      return data.publicUrl
    }

    return null
  } catch (error) {
    console.error("Error getting image URL:", error)
    return null
  }
}
