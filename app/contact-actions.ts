"use server"

import { headers } from "next/headers"
import { createServerSupabaseClient } from "@/lib/supabase"
import { sendContactWebhook } from "@/lib/contact-mail"

const SUBJECT_TAG_PREFIX = "[Rumi_website]"
const MIN_SECONDS_TO_SUBMIT = 4
const MAX_NAME_LENGTH = 120
const MAX_EMAIL_LENGTH = 254
const MAX_SUBJECT_LENGTH = 200
const MAX_MESSAGE_LENGTH = 5000
const IP_LIMIT_WINDOW_MINUTES = 15
const IP_LIMIT_MAX = 3
const EMAIL_LIMIT_WINDOW_HOURS = 24
const EMAIL_LIMIT_MAX = 2

export type ContactFormState = {
  error?: string | null
  message?: string | null
  success?: boolean
  reasonCode?: string | null
}

function normalizeText(value: FormDataEntryValue | null, maxLength: number): string {
  if (typeof value !== "string") return ""
  return value.trim().slice(0, maxLength)
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function buildTaggedSubject(subject: string): string {
  if (/^\[rumi_website\]\s*/i.test(subject)) {
    return subject
  }
  return `${SUBJECT_TAG_PREFIX} ${subject}`
}

function extractClientIp(headersList: Headers): string | null {
  const xForwardedFor = headersList.get("x-forwarded-for")
  const xRealIp = headersList.get("x-real-ip")
  const candidate = (xForwardedFor?.split(",")[0] ?? xRealIp ?? "").trim()

  if (!candidate) return null

  const ipv4Match = candidate.match(/^(\d{1,3}(?:\.\d{1,3}){3})(?::\d+)?$/)
  if (ipv4Match) return ipv4Match[1]

  const ipv6BracketMatch = candidate.match(/^\[([A-Fa-f0-9:]+)\](?::\d+)?$/)
  if (ipv6BracketMatch) return ipv6BracketMatch[1]

  if (/^[A-Fa-f0-9:]+$/.test(candidate)) return candidate
  return null
}

async function verifyTurnstile(token: string, remoteIp: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY

  if (!secret || !token) return false

  const body = new URLSearchParams({
    secret,
    response: token,
  })

  if (remoteIp) {
    body.append("remoteip", remoteIp)
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  })

  if (!response.ok) return false

  const result = (await response.json()) as { success?: boolean }
  return Boolean(result.success)
}

async function countRecentSubmissions(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  filterColumn: "ip" | "email",
  filterValue: string,
  sinceIso: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("contact_messages")
    .select("id", { count: "exact", head: true })
    .eq(filterColumn, filterValue)
    .gte("created_at", sinceIso)

  if (error) {
    console.error(`Failed to count recent submissions by ${filterColumn}:`, error)
    return 0
  }

  return count ?? 0
}

function getSpamError(spamReasons: string[]): string {
  if (spamReasons.some((reason) => reason === "rate_limit_ip" || reason === "rate_limit_email")) {
    return "Too many submissions. Please try again later."
  }

  if (spamReasons.some((reason) => reason === "turnstile_failed" || reason === "missing_turnstile_token")) {
    return "Please complete the verification and try again."
  }

  if (spamReasons.includes("submitted_too_fast")) {
    return "Please wait a few seconds and try again."
  }

  return "Unable to submit your message. Please try again."
}

export async function submitContactForm(_: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const name = normalizeText(formData.get("name"), MAX_NAME_LENGTH)
  const email = normalizeText(formData.get("email"), MAX_EMAIL_LENGTH).toLowerCase()
  const subject = normalizeText(formData.get("subject"), MAX_SUBJECT_LENGTH)
  const message = normalizeText(formData.get("message"), MAX_MESSAGE_LENGTH)
  const honeypot = normalizeText(formData.get("website"), 500)
  const turnstileToken = normalizeText(formData.get("cf-turnstile-response"), 4000)
  const formStartedAtRaw = normalizeText(formData.get("form_started_at"), 50)

  const headersList = await headers()
  const clientIp = extractClientIp(headersList)
  const userAgent = normalizeText(headersList.get("user-agent"), 512) || null
  const submittedAt = new Date().toISOString()

  const validationErrors: string[] = []
  const spamReasons: string[] = []

  if (!name) {
    validationErrors.push("Please provide your name.")
    spamReasons.push("missing_name")
  }

  if (!email) {
    validationErrors.push("Please provide your email.")
    spamReasons.push("missing_email")
  } else if (!isValidEmail(email)) {
    validationErrors.push("Please provide a valid email address.")
    spamReasons.push("invalid_email")
  }

  if (!subject) {
    validationErrors.push("Please provide a subject.")
    spamReasons.push("missing_subject")
  }

  if (!message) {
    validationErrors.push("Please provide a message.")
    spamReasons.push("missing_message")
  }

  if (honeypot) {
    spamReasons.push("honeypot_filled")
  }

  const startedAtMs = Number(formStartedAtRaw)
  if (!Number.isFinite(startedAtMs) || startedAtMs <= 0) {
    spamReasons.push("missing_form_start")
  } else {
    const elapsedSeconds = (Date.now() - startedAtMs) / 1000
    if (elapsedSeconds < MIN_SECONDS_TO_SUBMIT) {
      spamReasons.push("submitted_too_fast")
    }
  }

  if (!turnstileToken) {
    spamReasons.push("missing_turnstile_token")
  } else {
    try {
      const turnstilePassed = await verifyTurnstile(turnstileToken, clientIp)
      if (!turnstilePassed) {
        spamReasons.push("turnstile_failed")
      }
    } catch (error) {
      console.error("Turnstile verification failed:", error)
      spamReasons.push("turnstile_failed")
    }
  }

  const supabase = createServerSupabaseClient()

  try {
    const now = Date.now()
    const ipWindowStart = new Date(now - IP_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString()
    const emailWindowStart = new Date(now - EMAIL_LIMIT_WINDOW_HOURS * 60 * 60 * 1000).toISOString()

    if (clientIp) {
      const recentByIp = await countRecentSubmissions(supabase, "ip", clientIp, ipWindowStart)
      if (recentByIp >= IP_LIMIT_MAX) {
        spamReasons.push("rate_limit_ip")
      }
    }

    if (email) {
      const recentByEmail = await countRecentSubmissions(supabase, "email", email, emailWindowStart)
      if (recentByEmail >= EMAIL_LIMIT_MAX) {
        spamReasons.push("rate_limit_email")
      }
    }
  } catch (error) {
    console.error("Rate limit evaluation failed:", error)
  }

  const isSpam = spamReasons.length > 0
  const deliveryStatus = isSpam ? "blocked" : "not_sent"

  const { data: createdAttempt, error: createError } = await supabase
    .from("contact_messages")
    .insert({
      name,
      email,
      subject,
      message,
      ip: clientIp,
      user_agent: userAgent,
      is_spam: isSpam,
      spam_reasons: spamReasons,
      delivery_status: deliveryStatus,
      submitted_at: submittedAt,
    })
    .select("id")
    .single()

  if (createError) {
    console.error("Failed to save contact message:", createError)
    return {
      error: "Failed to send message. Please try again.",
      success: false,
      reasonCode: "save_failed",
    }
  }

  if (validationErrors.length > 0) {
    return {
      error: validationErrors[0],
      success: false,
      reasonCode: spamReasons[0] ?? null,
    }
  }

  if (isSpam) {
    return {
      error: getSpamError(spamReasons),
      success: false,
      reasonCode: spamReasons[0] ?? "blocked",
    }
  }

  const taggedSubject = buildTaggedSubject(subject)

  try {
    await sendContactWebhook({
      name,
      email,
      subject,
      taggedSubject,
      message,
      submittedAt,
      source: "rumi_website",
    })

    const { error: updateSentError } = await supabase
      .from("contact_messages")
      .update({ delivery_status: "sent" })
      .eq("id", createdAttempt.id)

    if (updateSentError) {
      console.error("Failed to update delivery status to sent:", updateSentError)
    }

    return {
      success: true,
      message: "Your message has been sent successfully. We'll get back to you soon!",
      error: null,
      reasonCode: null,
    }
  } catch (error) {
    console.error("Failed to deliver contact message:", error)

    const { error: updateFailedError } = await supabase
      .from("contact_messages")
      .update({ delivery_status: "failed" })
      .eq("id", createdAttempt.id)

    if (updateFailedError) {
      console.error("Failed to update delivery status to failed:", updateFailedError)
    }

    return {
      error: "Failed to send message. Please try again.",
      success: false,
      reasonCode: "delivery_failed",
    }
  }
}
