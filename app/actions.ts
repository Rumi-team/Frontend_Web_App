"use server"

import { createServerSupabaseClient } from "@/lib/supabase"

export type FormState = {
  success?: boolean
  message?: string
  error?: string
}

export async function submitWaitlistEntry(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const email = formData.get("email") as string
    const name = formData.get("name") as string

    // Validate inputs
    if (!email) {
      return {
        success: false,
        error: "Please provide your email address",
      }
    }

    if (!email.includes("@")) {
      return {
        success: false,
        error: "Please provide a valid email address",
      }
    }

    if (!name) {
      return {
        success: false,
        error: "Please provide your name",
      }
    }

    try {
      // Log environment variables (without revealing sensitive data)
      console.log("Supabase environment check:", {
        hasSupabaseUrl: !!process.env.SUPABASE_URL,
        hasNextPublicSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      })

      // Initialize Supabase client
      const supabase = createServerSupabaseClient()

      // Validate the data before insertion
      const userData = {
        email: email.trim(),
        name: name.trim(),
        created_at: new Date().toISOString(),
      }

      console.log("Attempting to insert user data:", { ...userData, email: '[REDACTED]' })

      // First, check if the table exists and is accessible
      const { data: tableCheck, error: tableError } = await supabase
        .from('users')
        .select('count')
        .limit(1)

      if (tableError) {
        console.error("Error checking users table:", tableError)
        return {
          success: false,
          error: `Database table error: ${tableError.message}`,
        }
      }

      // Insert into the new users table
      const { data, error: usersError } = await supabase
        .from("users")
        .insert([userData])
        .select()

      console.log("Insert response:", { 
        success: !usersError, 
        error: usersError ? usersError.message : null,
        data: data ? '[REDACTED]' : null 
      })

      if (usersError) {
        console.error("Error inserting into users table:", usersError)

        // Check if it's a duplicate email error
        if (
          usersError.message &&
          (usersError.message.includes("duplicate key") ||
            usersError.message.includes("unique constraint") ||
            usersError.message.includes("already exists"))
        ) {
          return {
            success: false,
            error: "This email is already registered with us",
          }
        }

        return {
          success: false,
          error: `Failed to register: ${usersError.message}`,
        }
      }

      // Verify the insertion by querying the inserted data
      const { data: verifyData, error: verifyError } = await supabase
        .from("users")
        .select("*")
        .eq("email", userData.email)
        .single()

      if (verifyError) {
        console.error("Error verifying insertion:", verifyError)
      } else {
        console.log("Successfully verified insertion:", { 
          email: '[REDACTED]',
          name: verifyData.name,
          created_at: verifyData.created_at 
        })
      }

      // Also insert into the website_waiting_list table for backward compatibility
      try {
        const { error: waitlistError } = await supabase
          .from("website_waiting_list")
          .insert([
            {
              email: userData.email,
              message: userData.name,
              created_at: userData.created_at,
            },
          ])

        if (waitlistError) {
          console.warn("Could not insert into legacy waitlist table:", waitlistError)
        }
      } catch (waitlistError) {
        console.warn("Could not insert into legacy waitlist table:", waitlistError)
      }

      return {
        success: true,
        message: "Thank you for joining! We'll be in touch soon.",
      }
    } catch (supabaseError) {
      console.error("Supabase error:", supabaseError)
      return {
        success: false,
        error: "Database connection error. Please try again later.",
      }
    }
  } catch (error) {
    console.error("Error in submitWaitlistEntry:", error)
    return {
      success: false,
      error: "An unexpected error occurred. Please try again later.",
    }
  }
}
