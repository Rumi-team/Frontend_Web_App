"use server"

import { createServerSupabaseClient } from "@/lib/supabase"

// --------------------------------------------
// Google Apps Script webhook for wait‑list e‑mail
const WEBHOOK_URL = process.env.RUMI_MAIL_WEBHOOK

async function notifyAppsScript(name: string, email: string) {
  if (!WEBHOOK_URL) {
    console.warn("RUMI_MAIL_WEBHOOK env var not set.")
    return
  }
  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email })
    })
  } catch (err) {
    console.error("Failed to notify Apps Script:", err)
  }
}
// --------------------------------------------

export type FormState = {
  error?: string | null
  message?: string | null
  success?: boolean
  alreadyJoined?: boolean
}

export const submitWaitlistEntry = async (prevState: FormState, formData: FormData): Promise<FormState> => {
  const name = formData.get("name") as string
  const email = formData.get("email") as string

  if (!name || !email) {
    return {
      error: "Please provide your name and email.",
      success: false,
      message: null,
    }
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      error: "Please provide a valid email address.",
      success: false,
      message: null,
    }
  }

  try {
    // Use the server Supabase client
    const supabase = createServerSupabaseClient()

    console.log("Checking if email exists:", email)

    // Check if the email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("email")
      .eq("email", email.trim())
      .maybeSingle()

    if (checkError) {
      console.error("Error checking for existing user:", checkError)
      return {
        error: "An error occurred while checking your email. Please try again.",
        success: false,
        message: null,
      }
    }

    // If user already exists, return a specific message
    if (existingUser) {
      console.log("User already exists:", email)
      return {
        success: false,
        message: "You have already joined Rumi.",
        error: null,
        alreadyJoined: true,
      }
    }

    // Insert the new user
    const { error: insertError } = await supabase.from("users").insert([
      {
        name: name.trim(),
        email: email.trim(),
        created_at: new Date().toISOString(),
      },
    ])

    if (insertError) {
      console.error("Error inserting user:", insertError)

      // Check if it's a duplicate key error (just in case)
      if (insertError.code === "23505") {
        return {
          success: false,
          message: "You have already joined Rumi.",
          error: null,
          alreadyJoined: true,
        }
      }

      return {
        error: `Registration failed: ${insertError.message}`,
        success: false,
        message: null,
      }
    }

    // -- Also upsert into survey_users to track survey leads --
    const { error: surveyUsersError } = await supabase
      .from("survey_users")
      .upsert(
        { name: name.trim(), email: email.trim() },
        { onConflict: "email" } // email must be UNIQUE in survey_users
      )

    if (surveyUsersError) {
      console.error("survey_users upsert error:", surveyUsersError.message)
      // Note: we don't fail the whole request if this table insert fails
    }

    console.log("User registered successfully:", { name, email })

    // Fire‑and‑forget email with Google Apps Script
    notifyAppsScript(name.trim(), email.trim()).catch(console.error)

    return {
      success: true,
      message: `Thank you, ${name}! You've been added to our waitlist.`,
      error: null,
    }
  } catch (error: any) {
    console.error("Failed to submit waitlist entry:", error)
    return {
      error: "Failed to submit. Please try again.",
      success: false,
      message: null,
    }
  }
}
