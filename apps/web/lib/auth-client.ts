import { createAuthClient } from "better-auth/react";

/**
 * Better Auth React Client
 * Handles authentication state and actions
 * 
 * Note: baseURL is explicitly provided to allow cross-origin requests in production
 * (harden against Next.js rewrite failures). 
 * fetchOptions: { credentials: "include" } is required for cookie sharing.
 */
const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || undefined,
  basePath: `/api/auth`,
  fetchOptions: {
    credentials: "include",
    onError: (ctx) => {
      console.error("Auth client error:", ctx.error);
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
      },
    },
  },
}) as any;

// Export typed hooks and actions
export const { signIn, signUp, signOut, useSession, getSession } = authClient;

// Export types
export type Session = any;
export type User = any;
