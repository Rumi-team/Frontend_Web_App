import { describe, it, expect, vi, beforeEach } from "vitest"

const mockGetUser = vi.fn()
const mockUpsert = vi.fn()

vi.mock("@/lib/supabase-auth", () => ({
  createSupabaseServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: () => ({ upsert: mockUpsert }),
  })),
}))

const { PATCH } = await import("@/app/api/user/settings/route")

describe("PATCH /api/user/settings", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUpsert.mockResolvedValue({ error: null })
  })

  it("returns 401 without auth session", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

    const req = new Request("http://localhost/api/user/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selectedVoice: "Puck" }),
    })

    const res = await PATCH(req)
    expect(res.status).toBe(401)
  })

  it("strips unknown keys from body", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    })

    const req = new Request("http://localhost/api/user/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        selectedVoice: "Puck",
        admin: true,
        evil_key: "drop table",
      }),
    })

    await PATCH(req)

    const upsertArg = mockUpsert.mock.calls[0][0]
    expect(upsertArg).toHaveProperty("selectedVoice", "Puck")
    expect(upsertArg).not.toHaveProperty("admin")
    expect(upsertArg).not.toHaveProperty("evil_key")
  })

  it("cannot overwrite another user's settings via body user_id", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "real-user" } },
      error: null,
    })

    const req = new Request("http://localhost/api/user/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: "victim-user",
        selectedVoice: "Fenrir",
      }),
    })

    await PATCH(req)

    const upsertArg = mockUpsert.mock.calls[0][0]
    expect(upsertArg.user_id).toBe("real-user")
    expect(upsertArg).not.toHaveProperty("victim-user")
  })
})
