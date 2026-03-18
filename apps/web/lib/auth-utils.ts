"use client";

import { signOut } from "./auth-client";

/**
 * Client-side utility to handle unauthorized access
 * Clears session and redirects to login
 */
export async function handleUnauthorized() {
  try {
    // Call better-auth signOut
    await signOut();
  } catch (error) {
    console.error("Error clearing session:", error);
  }

  // Redirect to login
  window.location.href = "/login";
}

/**
 * Wrapper for fetch calls that handles 401 responses
 */
export async function authFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const response = await fetch(url, options);

  if (response.status === 401) {
    const data = await response.json().catch(() => ({}));

    if (
      data.error === "Unauthorized" ||
      data.message?.includes("token") ||
      data.message?.includes("expired")
    ) {
      await handleUnauthorized();
      throw new Error("Unauthorized - redirecting to login");
    }
  }

  return response;
}
