"use server"

import { createServerSupabaseClient } from "@/lib/supabase"

export type ContactFormState = {
  error?: string | null
  message?: string | null
  success?: boolean
}

export async function submitContactForm(prevState: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const email = formData.get("email") as string
  const name = formData.get("name") as string
  const message = formData.get("message") as string

  if (!email || !message) {
    return {
      error: "Please provide both email and message.",
      success: false,
    }
  }

  if (!name) {
    return {
      error: "Please provide your name.",
      success: false,
    }
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      error: "Please provide a valid email address.",
      success: false,
    }
  }

  try {
    const supabase = createServerSupabaseClient()

    console.log("Attempting to save contact message:", { name, email, messageLength: message.length })

    // First check if the email exists in the users table
    const { data: existingUser } = await supabase.from("users").select("email").eq("email", email.trim()).maybeSingle()

    if (existingUser) {
      // Update the existing user's message and name
      const { error: updateError } = await supabase
        .from("users")
        .update({
          message: message.trim(),
          name: name.trim(),
        })
        .eq("email", email.trim())

      if (updateError) {
        console.error("Error updating message:", updateError)
        return {
          error: "Failed to send message. Please try again.",
          success: false,
        }
      }
    } else {
      // Insert a new user with the message
      const { error: insertError } = await supabase.from("users").insert([
        {
          email: email.trim(),
          name: name.trim(),
          message: message.trim(),
          created_at: new Date().toISOString(),
        },
      ])

      if (insertError) {
        console.error("Error inserting message:", insertError)
        return {
          error: "Failed to send message. Please try again.",
          success: false,
        }
      }
    }

    console.log("Message saved successfully")

    return {
      success: true,
      message: "Your message has been sent successfully. We'll get back to you soon!",
    }
  } catch (error: any) {
    console.error("Failed to submit contact form:", error)
    return {
      error: "An unexpected error occurred. Please try again.",
      success: false,
    }
  }
}
