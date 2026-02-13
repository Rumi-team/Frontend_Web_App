import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders })
    }

    try {
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

        // This function can be called via webhook (payload has 'record') or directly
        const payload = await req.json()
        const record = payload.record || payload

        console.log("Processing contact request:", record)

        const { name, email, subject, message } = record

        if (!RESEND_API_KEY) {
            console.warn("RESEND_API_KEY not set. Logging email instead:")
            console.log(`To: ali@rumi.team\nSubject: ${subject}\nFrom: ${name} <${email}>\nMessage: ${message}`)

            return new Response(
                JSON.stringify({ message: "Email logged (API key missing)", success: true }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            )
        }

        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: "Rumi Contact Form <onboarding@resend.dev>", // Update this if you have a verified domain
                to: ["ali@rumi.team"],
                reply_to: email, // Allow replying directly to the user
                subject: `[Rumi Contact] ${subject || "New Message"}`,
                html: `
          <h3>New Contact Form Submission</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <blockquote style="border-left: 4px solid #ccc; padding-left: 10px; margin-left: 0;">
            ${message.replace(/\n/g, "<br>")}
          </blockquote>
        `,
            }),
        })

        const data = await res.json()

        if (!res.ok) {
            console.error("Resend API error:", data)
            throw new Error(data.message || "Failed to send email")
        }

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
    } catch (error) {
        console.error("Error processing contact email:", error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        })
    }
})
