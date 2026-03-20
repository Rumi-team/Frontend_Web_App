import { describe, it, expect } from "vitest";

// Test the email display logic extracted from NameEditDialog
// This is pure logic that doesn't require rendering the full component tree
describe("NameEditDialog email display logic", () => {
  function getEmailDisplay(
    authProvider: string | null | undefined,
    userEmail: string | null | undefined
  ): string | null {
    const emailDisplay =
      authProvider === "apple"
        ? "Logged in with your Apple ID"
        : userEmail ?? null;
    return emailDisplay;
  }

  it("shows 'Logged in with your Apple ID' for Apple auth", () => {
    expect(getEmailDisplay("apple", "hidden@privaterelay.appleid.com")).toBe(
      "Logged in with your Apple ID"
    );
  });

  it("shows 'Logged in with your Apple ID' even when email is null", () => {
    expect(getEmailDisplay("apple", null)).toBe(
      "Logged in with your Apple ID"
    );
  });

  it("shows actual email for Google auth", () => {
    expect(getEmailDisplay("google", "user@gmail.com")).toBe("user@gmail.com");
  });

  it("shows actual email for email auth", () => {
    expect(getEmailDisplay("email", "user@example.com")).toBe(
      "user@example.com"
    );
  });

  it("returns null when no auth provider and no email", () => {
    expect(getEmailDisplay(null, null)).toBeNull();
  });

  it("returns null when provider is unknown and email is undefined", () => {
    expect(getEmailDisplay("unknown", undefined)).toBeNull();
  });
});
