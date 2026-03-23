import { createAuthClient } from "better-auth/react";

/**
 * Better Auth React Client
 * Handles authentication state and actions
 * 
 * Note: baseURL is omitted to use same-origin requests via Next.js rewrites
 * This ensures cookies are set on the frontend domain (domain.com) instead of backend (api.domain.com)
 */
const authClient = createAuthClient({
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
