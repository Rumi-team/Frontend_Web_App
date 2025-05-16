import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Get all users, ordered by creation date (newest first)
    const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching users:", error)
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    // Return the users data
    return NextResponse.json({ users: data })
  } catch (error) {
    console.error("Error in users API:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
