type ContactDeliveryPayload = {
  name: string
  email: string
  subject: string
  taggedSubject: string
  message: string
  submittedAt: string
  source: "rumi_website"
}

export async function sendContactWebhook(payload: ContactDeliveryPayload): Promise<void> {
  const webhookUrl = process.env.RUMI_CONTACT_WEBHOOK
  const webhookSecret = process.env.RUMI_CONTACT_WEBHOOK_SECRET
  const recipientEmail = process.env.CONTACT_RECIPIENT_EMAIL

  if (!webhookUrl || !webhookSecret || !recipientEmail) {
    throw new Error("Missing contact email configuration.")
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-rumi-contact-secret": webhookSecret,
    },
    body: JSON.stringify({
      ...payload,
      recipientEmail,
    }),
  })

  if (!response.ok) {
    throw new Error(`Contact webhook failed with status ${response.status}.`)
  }
}
