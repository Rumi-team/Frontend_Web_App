"use server"

// HubSpot integration
const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN

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
    if (!HUBSPOT_ACCESS_TOKEN) {
      console.error("HUBSPOT_ACCESS_TOKEN env var not set.")
      return {
        error: "Server configuration error. Please try again later.",
        success: false,
        message: null,
      }
    }

    console.log("Checking HubSpot for existing contact:", email)

    const searchRes = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [{ propertyName: "email", operator: "EQ", value: email.trim() }],
          },
        ],
        properties: ["email"],
        limit: 1,
      }),
    })

    if (!searchRes.ok) {
      console.error("HubSpot search error:", await searchRes.text())
      return {
        error: "An error occurred while checking your email. Please try again.",
        success: false,
        message: null,
      }
    }

    const searchData = (await searchRes.json()) as { total?: number }
    if (searchData.total && searchData.total > 0) {
      console.log("Contact already exists in HubSpot:", email)
      return {
        success: false,
        message: "You have already joined Rumi.",
        error: null,
        alreadyJoined: true,
      }
    }

    const createRes = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        properties: {
          email: email.trim(),
          firstname: name.trim(),
        },
      }),
    })

    if (!createRes.ok) {
      const errorData = await createRes.json().catch(() => ({}))
      console.error("HubSpot create contact error:", errorData)
      return {
        error: `Registration failed: ${errorData.message || createRes.statusText}`,
        success: false,
        message: null,
      }
    }

    console.log("HubSpot contact created:", { name, email })

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
