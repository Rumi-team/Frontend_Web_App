"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { headers } from "next/headers"

export type ContactFormState = {
  error?: string | null
  message?: string | null
  success?: boolean
}

export async function submitContactForm(prevState: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const email = formData.get("email") as string
  const name = formData.get("name") as string
  const subject = formData.get("subject") as string
  const message = formData.get("message") as string
  const honeypot = formData.get("website") as string // Honeypot field

  // Spam check: if honeypot is filled, return success (bot trap)
  if (honeypot) {
    console.log("Bot detected (honeypot filled). Returning fake success.")
    return {
      success: true,
      message: "Your message has been sent successfully. We'll get back to you soon!",
    }
  }

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


    // Get IP address for spam tracking
    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for") || "unknown"

    // Rate Limiting: Check for recent submissions from this IP
    // Allow max 3 submissions per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    // We only check if we have a valid IP
    if (ip && ip !== "unknown" && ip !== "::1" && ip !== "127.0.0.1") {
      const { count, error: rateLimitError } = await supabase
        .from("contact_list")
        .select("*", { count: "exact", head: true })
        .eq("ip_address", ip)
        .gte("created_at", oneHourAgo)

      if (rateLimitError) {
        // Log error but allow submission to proceed (fail open) to avoid blocking legitimate users due to DB issues
        console.error("Error checking rate limit:", rateLimitError)
      } else if (count !== null && count >= 3) {
        console.warn(`Rate limit exceeded for IP: ${ip}`)
        return {
          success: false,
          error: "You have sent too many messages recently. Please try again later."
        }
      }
    }

    console.log("Attempting to save contact message:", { name, email, subject, messageLength: message.length })

    // Insert into contact_list table
    const { error: insertError } = await supabase.from("contact_list").insert([
      {
        email: email.trim(),
        name: name.trim(),
        subject: subject ? subject.trim() : "New Contact Inquiry",
        message: message.trim(),
        ip_address: ip,
        created_at: new Date().toISOString(),
      },
    ])

    if (insertError) {
      console.error("Error inserting message into contact_list:", insertError)
      return {
        error: "Failed to send message. Please try again.",
        success: false,
      }
    }

    console.log("Message saved successfully to contact_list")

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
