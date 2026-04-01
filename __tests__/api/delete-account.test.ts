import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock Supabase clients
const mockGetUser = vi.fn()
const mockRpc = vi.fn()
const mockDeleteUser = vi.fn()

vi.mock("@/lib/supabase-auth", () => ({
  createSupabaseServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}))

vi.mock("@/lib/supabase", () => ({
  createServerSupabaseClient: vi.fn(() => ({
    rpc: mockRpc,
    auth: { admin: { deleteUser: mockDeleteUser } },
  })),
}))

// Import the route handler after mocks are set up
const { POST } = await import("@/app/api/user/delete/route")

describe("DELETE /api/user/delete", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns 401 when no auth session", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

    const res = await POST()
    expect(res.status).toBe(401)
    expect(mockRpc).not.toHaveBeenCalled()
    expect(mockDeleteUser).not.toHaveBeenCalled()
  })

  it("calls delete_user_cascade RPC with server-verified user ID", async () => {
    const userId = "test-user-uuid-123"
    mockGetUser.mockResolvedValue({ data: { user: { id: userId } }, error: null })
    mockRpc.mockResolvedValue({ error: null })
    mockDeleteUser.mockResolvedValue({ error: null })

    const res = await POST()
    expect(res.status).toBe(200)
    expect(mockRpc).toHaveBeenCalledWith("delete_user_cascade", {
      target_user_id: userId,
    })
    expect(mockDeleteUser).toHaveBeenCalledWith(userId)
  })

  it("does NOT call deleteUser if RPC cascade fails", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null })
    mockRpc.mockResolvedValue({ error: { message: "FK violation" } })

    const res = await POST()
    expect(res.status).toBe(500)
    expect(mockDeleteUser).not.toHaveBeenCalled()
  })

  it("returns 500 with message if auth deletion fails after cascade", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null })
    mockRpc.mockResolvedValue({ error: null })
    mockDeleteUser.mockResolvedValue({ error: { message: "Auth error" } })

    const res = await POST()
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toContain("auth removal failed")
  })
})
