import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
}

Deno.serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders })
    }

    try {
        const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")

        // Parse request body
        const payload = await req.json()
        const record = payload.record || payload

        console.log("Processing contact request:", JSON.stringify(record))

        const { name, email, subject, message } = record

        if (!name || !email || !message) {
            console.error("Missing required fields:", { name, email, message })
            return new Response(
                JSON.stringify({ error: "Missing required fields" }),
                {
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                    status: 400,
                }
            )
        }

        if (!RESEND_API_KEY) {
            console.warn("RESEND_API_KEY not set. Logging email content instead:")
            console.log(
                `To: ali@rumi.team\nSubject: ${subject}\nFrom: ${name} <${email}>\nMessage: ${message}`
            )

            return new Response(
                JSON.stringify({
                    message: "Email logged (RESEND_API_KEY not configured)",
                    success: true,
                }),
                {
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                    status: 200,
                }
            )
        }

        console.log("Sending email via Resend API...")

        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: "Rumi Contact Form <onboarding@resend.dev>",
                to: ["ali@rumi.team"],
                reply_to: email,
                subject: `[Rumi Contact] ${subject || "New Message"}`,
                html: `
          <h3>New Contact Form Submission</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject || "N/A"}</p>
          <p><strong>Message:</strong></p>
          <blockquote style="border-left: 4px solid #eab308; padding-left: 12px; margin-left: 0; color: #333;">
            ${String(message).replace(/\n/g, "<br>")}
          </blockquote>
          <hr>
          <p style="color: #999; font-size: 12px;">Sent from rumi.team contact form</p>
        `,
            }),
        })

        const data = await res.json()
        console.log("Resend API response:", JSON.stringify(data), "Status:", res.status)

        if (!res.ok) {
            console.error("Resend API error:", JSON.stringify(data))
            return new Response(JSON.stringify({ error: data.message || "Failed to send email" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 500,
            })
        }

        console.log("Email sent successfully!")

        return new Response(JSON.stringify({ success: true, data }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        })
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        console.error("Error processing contact email:", errorMessage)
        return new Response(JSON.stringify({ error: errorMessage }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        })
    }
})
