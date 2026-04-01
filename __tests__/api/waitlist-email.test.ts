import { describe, it, expect, vi, beforeEach } from "vitest"

// Test the email template and route logic by checking the exported handler
// The Supabase and Resend mocks are complex chains, so we test the key behaviors:
// 1. Missing email → 400
// 2. Email HTML contains the required content

describe("POST /api/waitlist-email", () => {
  it("returns 400 if email is missing from body", async () => {
    // Mock dependencies
    vi.doMock("resend", () => ({ Resend: vi.fn(() => ({ emails: { send: vi.fn() } })) }))
    vi.doMock("@/lib/supabase", () => ({
      createServerSupabaseClient: vi.fn(() => ({ from: () => ({}) })),
    }))
    vi.stubEnv("RESEND_API_KEY", "re_test")

    const { POST } = await import("@/app/api/waitlist-email/route")
    const req = new Request("http://localhost/api/waitlist-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test" }),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)

    vi.doUnmock("resend")
    vi.doUnmock("@/lib/supabase")
  })

  it("email template contains all required sections", async () => {
    // Read the route file to verify the HTML template contains key content
    const fs = await import("fs")
    const routeCode = fs.readFileSync(
      "./app/api/waitlist-email/route.ts",
      "utf-8"
    )

    // Verify key content from Ali's email is in the template
    expect(routeCode).toContain("Hybrid model")
    expect(routeCode).toContain("Collaborative care")
    expect(routeCode).toContain("Continuous accountability")
    expect(routeCode).toContain("Security &amp; Privacy")
    expect(routeCode).toContain("$149/month")
    expect(routeCode).toContain("Which U.S. state")
    expect(routeCode).toContain("video sessions, phone sessions, or text chat")
    expect(routeCode).toContain("ali@rumi.team")
  })
})
