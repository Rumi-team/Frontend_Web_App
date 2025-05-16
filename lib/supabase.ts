import { createClient } from "@supabase/supabase-js"

// Create a single supabase client for the server
export const createServerSupabaseClient = () => {
  // Use environment variables directly
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
    })
    throw new Error("Missing Supabase environment variables")
  }

  // Ensure URL is properly formatted with https://
  const formattedUrl = supabaseUrl.startsWith("http") ? supabaseUrl : `https://${supabaseUrl}`

  try {
    const client = createClient(formattedUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: 'public'
      }
    })

    // Test the connection and permissions
    client.from("users").select("count").limit(1).then(
      () => {
        console.log("Successfully connected to Supabase and verified table access")
      },
      (error: Error) => {
        console.error("Failed to connect to Supabase or access table:", error)
        throw new Error(`Failed to connect to Supabase: ${error.message}`)
      }
    )

    return client
  } catch (error: unknown) {
    console.error("Error creating Supabase client:", error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to create Supabase client: ${errorMessage}`)
  }
}

// Create a single supabase client for the browser
export const createBrowserSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables for browser client")
    throw new Error("Missing Supabase environment variables")
  }

  // Ensure URL is properly formatted with https://
  const formattedUrl = supabaseUrl.startsWith("http") ? supabaseUrl : `https://${supabaseUrl}`

  try {
    const client = createClient(formattedUrl, supabaseKey, {
      db: {
        schema: 'public'
      }
    })
    return client
  } catch (error: unknown) {
    console.error("Error creating browser Supabase client:", error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to create browser Supabase client: ${errorMessage}`)
  }
}
