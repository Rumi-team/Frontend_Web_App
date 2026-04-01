import { NextResponse } from "next/server"
import { Resend } from "resend"
import { createServerSupabaseClient } from "@/lib/supabase"

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error("RESEND_API_KEY not configured")
  return new Resend(key)
}

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 })
    }

    // Rate limit: only send if waitlist entry exists with email_sent = false
    const supabase = createServerSupabaseClient()
    const { data: entry } = await supabase
      .from("website_waitlist")
      .select("id, email_sent")
      .eq("email", email)
      .maybeSingle()

    if (!entry) {
      return NextResponse.json({ error: "Not on waitlist" }, { status: 403 })
    }

    if (entry.email_sent) {
      return NextResponse.json({ error: "Email already sent" }, { status: 403 })
    }

    const firstName = name?.split(" ")[0] || "there"

    const resend = getResend()
    const { error } = await resend.emails.send({
      from: "Ali from Rumi <ali@rumi.team>",
      to: email,
      subject: "Welcome to Rumi's AI + Human Coaching Program",
      html: buildEmailHtml(firstName),
    })

    if (error) {
      console.error("Resend error:", error)
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    // Mark email as sent
    await supabase
      .from("website_waitlist")
      .update({ email_sent: true, email_sent_at: new Date().toISOString() })
      .eq("id", entry.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Waitlist email error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

function buildEmailHtml(firstName: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

<p>Hi ${firstName},</p>

<p>Ali, Founder &amp; CEO of Rumi here. Thank you so much for reaching out about Rumi's new AI + human coaching program!</p>

<p>You'd be among the very first people to experience this new offering, and we're excited to build it with early members like you.</p>

<h3 style="color: #1a1a1a; margin-top: 24px;">Here's how it works:</h3>

<p><strong>Hybrid model:</strong> Next to your 24/7 access to Rumi AI coaching, we'll match you with a Rumi-vetted human life coach. Every coach on our platform goes through a rigorous screening process and is subject to ongoing quality assurance, so you can trust you're working with someone exceptional. You'll have a monthly session with your human coach, and your AI will keep your coach informed between sessions so you get the most out of every conversation with them.</p>

<p><strong>Collaborative care:</strong> Your AI and human coach work together as a team. Your Rumi AI keeps your coach up to date between sessions, and your coach's insights flow back into your AI experience, so your growth journey is coordinated, intentional, and moves faster than either could on its own.</p>

<p><strong>Continuous accountability:</strong> Your human coach stays informed of your progress and overall wellbeing through Rumi, adding an extra layer of support between sessions.</p>

<p><strong>Security &amp; Privacy:</strong> Just like the Rumi app, your human coaching experience is built on enterprise-grade privacy standards. Your data stays yours.</p>

<p><strong>Pricing:</strong> The Rumi+Human program is <strong>$149/month</strong>, which includes unlimited 24/7 Rumi AI coaching plus a monthly 30-minute live session with your dedicated human coach, as well as unlimited asynchronous messaging with your coach.</p>

<hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />

<p>We're currently finalizing the program details and want to make sure it's shaped around what works best for you. Could you take a moment to answer a few quick questions?</p>

<ol style="padding-left: 20px;">
  <li>Which U.S. state are you currently based in?</li>
  <li>Are you currently working with a life coach, mentor, or other personal development professional?</li>
  <li>What's been the hardest part about using Rumi on its own?</li>
  <li>When you imagine your ideal setup, what would the human coach do that Rumi doesn't? And how would you like your human coach to integrate with the AI experience?</li>
  <li>Do you have any preferences for your human coach? (e.g. gender, background, cultural familiarity, specialty areas like career, relationships, or mindset)</li>
  <li>Would you prefer video sessions, phone sessions, or text chat with your human coach?</li>
</ol>

<p>Just reply to this email with your answers and we'll be in touch with next steps. We're matching our first cohort over the next few weeks.</p>

<p>We're so glad you're here early. It means a lot to have you help shape this.</p>

<p>If you have any questions, let me know :)</p>

<p>Warmly,<br/><strong>Ali</strong></p>

</body>
</html>
`
}
