import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/components/auth-provider";

// Mock Supabase browser client
const mockExchangeCodeForSession = vi.fn().mockResolvedValue({ error: null });
const mockGetSession = vi.fn().mockResolvedValue({
  data: { session: null },
});
const mockOnAuthStateChange = vi.fn().mockReturnValue({
  data: { subscription: { unsubscribe: vi.fn() } },
});

vi.mock("@/lib/supabase-auth-browser", () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      exchangeCodeForSession: mockExchangeCodeForSession,
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      signInWithOAuth: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      signUp: vi.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn().mockResolvedValue({}),
    },
  }),
}));

function AuthConsumer() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="provider-user-id">{auth.providerUserId ?? "null"}</span>
      <span data-testid="display-name">{auth.displayName ?? "null"}</span>
      <span data-testid="user-email">{auth.userEmail ?? "null"}</span>
      <span data-testid="auth-provider">{auth.authProvider ?? "null"}</span>
      <span data-testid="is-loading">{String(auth.isLoading)}</span>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset URL
    window.history.replaceState(null, "", "/");
  });

  it("provides null values when no session exists", async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    // Wait for getSession to resolve
    await act(() => Promise.resolve());

    expect(screen.getByTestId("provider-user-id")).toHaveTextContent("null");
    expect(screen.getByTestId("auth-provider")).toHaveTextContent("null");
    expect(screen.getByTestId("user-email")).toHaveTextContent("null");
  });

  it("resolves Apple provider identity for providerUserId", async () => {
    const appleUser = {
      id: "user-123",
      email: "user@privaterelay.appleid.com",
      identities: [
        {
          provider: "apple",
          identity_data: { sub: "apple-sub-001" },
        },
      ],
      user_metadata: { full_name: "Test User" },
      app_metadata: { provider: "apple" },
    };

    mockGetSession.mockResolvedValueOnce({
      data: { session: { user: appleUser } },
    });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await act(() => Promise.resolve());

    expect(screen.getByTestId("provider-user-id")).toHaveTextContent("apple-sub-001");
    expect(screen.getByTestId("auth-provider")).toHaveTextContent("apple");
  });

  it("resolves Google provider identity when no Apple identity", async () => {
    const googleUser = {
      id: "user-456",
      email: "user@gmail.com",
      identities: [
        {
          provider: "google",
          identity_data: { sub: "google-sub-002" },
        },
      ],
      user_metadata: { full_name: "Google User", name: "Google User" },
      app_metadata: { provider: "google" },
    };

    mockGetSession.mockResolvedValueOnce({
      data: { session: { user: googleUser } },
    });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await act(() => Promise.resolve());

    expect(screen.getByTestId("provider-user-id")).toHaveTextContent("google-sub-002");
    expect(screen.getByTestId("auth-provider")).toHaveTextContent("google");
    expect(screen.getByTestId("user-email")).toHaveTextContent("user@gmail.com");
  });

  it("PKCE code exchange runs only once (codeExchangeDone ref)", async () => {
    // Simulate URL with ?code=abc
    window.history.replaceState(null, "", "/?code=test-pkce-code");

    const { unmount } = render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await act(() => Promise.resolve());

    // Should have been called exactly once
    expect(mockExchangeCodeForSession).toHaveBeenCalledTimes(1);
    expect(mockExchangeCodeForSession).toHaveBeenCalledWith("test-pkce-code");

    // URL should be cleaned
    expect(window.location.search).toBe("");

    unmount();

    // Render again (simulates React Strict Mode double-render or back navigation)
    // Reset URL to simulate the scenario where the code might still be processed
    // The ref should prevent double exchange within the same mount
    mockExchangeCodeForSession.mockClear();

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await act(() => Promise.resolve());

    // No code in URL anymore (was cleaned), so exchange should not fire
    expect(mockExchangeCodeForSession).not.toHaveBeenCalled();
  });

  it("useAuth throws when used outside AuthProvider", () => {
    // Suppress React error boundary console output
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<AuthConsumer />)).toThrow(
      "useAuth must be used within an AuthProvider"
    );

    spy.mockRestore();
  });
});
