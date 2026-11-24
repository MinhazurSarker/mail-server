"use client";

/**
 * Unified session and cookie synchronization for CellsInbox web frontend.
 * Ensures localStorage and HTTP authorization cookies remain in lockstep
 * across login, onboarding, account switching, and logout.
 */

export function setSessionTokens(accessToken: string, refreshToken?: string): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("accessToken", accessToken);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }

    const isSecure = window.location.protocol === "https:";
    document.cookie = `authorization=Bearer ${accessToken}; path=/; max-age=604800; SameSite=Lax${isSecure ? "; Secure" : ""};`;
  } catch (err) {
    console.error("Failed to write session tokens:", err);
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("activeAccountId");
    localStorage.removeItem("cellsinbox_accounts");
    document.cookie = "authorization=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax;";
  } catch (err) {
    console.error("Failed to clear session:", err);
  }
}
