"use client";

/**
 * AuthInitializer - No longer needed with better-auth
 *
 * The better-auth useSession hook automatically handles session loading.
 * This component is kept for backwards compatibility but does nothing.
 * It can be safely removed from the layout in the future.
 */
export function AuthInitializer() {
  // No-op: better-auth's useSession hook handles session initialization
  return null;
}
