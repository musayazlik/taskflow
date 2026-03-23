/**
 * @fileoverview Better Auth server instance: Prisma adapter, sessions, email/password, OAuth, cookies.
 * HTTP routes are mounted under `/api/auth` in `nest/main.ts`.
 * @module @api/lib/auth
 */

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@repo/database";
import { env } from "@api/lib/env";
import { logger } from "@api/lib/logger";
import { sendVerificationEmail, sendPasswordResetEmail } from "../../emails";

function parseCsvOrigins(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isNonLocalHttpsUrl(value: string | undefined): boolean {
  if (!value) return false;
  try {
    const u = new URL(value);
    return u.protocol === "https:" && u.hostname !== "localhost";
  } catch {
    return false;
  }
}

const trustedOrigins = Array.from(
  new Set(
    [
      env.FRONTEND_URL,
      env.BETTER_AUTH_URL,
      ...parseCsvOrigins(process.env.AUTH_TRUSTED_ORIGINS),
    ].filter((v): v is string => Boolean(v)),
  ),
);

const enableCrossSubdomainCookies =
  (env.NODE_ENV === "production" || env.NODE_ENV === "staging") &&
  isNonLocalHttpsUrl(env.FRONTEND_URL);

/**
 * Singleton Better Auth instance.
 *
 * @remarks
 * - **Database**: PostgreSQL via Prisma adapter; user `role` is an additional field for guards.
 * - **Emails**: verification and password reset use `src/emails` (Resend).
 * - **URLs**: `baseURL` is `env.BETTER_AUTH_URL || env.FRONTEND_URL` for OAuth and magic links.
 * - **Session**: cookie name `turbostack_session`, 7-day expiry (see config block below).
 *
 * Use `auth.api.getSession({ headers })` or Nest `BetterAuthGuard` for request authentication.
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  basePath: "/api/auth", // Better Auth endpoints at /api/auth/*

  user: {
    additionalFields: {
      role: {
        type: "string",
      },
    },
  },

  // Email and Password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: false,

    // Send password reset email
    sendResetPassword: async ({ user, url, token }, request) => {
      const resetPasswordUrl = `${env.FRONTEND_URL}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;
      logger.info({ email: user.email }, "Sending password reset email");
      try {
        await sendPasswordResetEmail({
          to: user.email,
          url: resetPasswordUrl,
          token,
          userName: user.name || undefined,
        });
        logger.info({ email: user.email }, "Password reset email sent successfully");
      } catch (error) {
        logger.error({ err: error, email: user.email }, "Failed to send password reset email");
      }
    },

    resetPasswordTokenExpiresIn: 3600, // 1 hour
  },

  // Email verification
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`;
      logger.info({ email: user.email }, "Sending verification email");
      try {
        await sendVerificationEmail({
          to: user.email,
          url: verificationUrl,
          token,
          userName: user.name || undefined,
        });
        logger.info({ email: user.email }, "Verification email sent successfully");
      } catch (error) {
        logger.error({ err: error, email: user.email }, "Failed to send verification email");
      }
    },
    sendVerificationOnSignUp: true,
  },

  // Social OAuth Providers
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID || "",
      clientSecret: env.GOOGLE_CLIENT_SECRET || "",
      // Callback URL: {baseURL}/api/auth/callback/google
    },
  },

  // Session configuration
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (updates session if older than this)
    cookieName: "turbostack_session",
  },

  // Base URL for email links and OAuth callbacks
  baseURL: env.BETTER_AUTH_URL || env.FRONTEND_URL,

  // Trusted origins for CORS
  trustedOrigins,

  // Advanced options
  advanced: {
    generateId: false, // Use Prisma's default cuid()
    // Respect x-forwarded-* headers when API runs behind reverse proxies/CDNs.
    // This keeps Better Auth's HTTPS/origin detection consistent in production.
    trustedProxyHeaders: true,
    // Keep secure cookies enabled in production-like environments.
    useSecureCookies: env.NODE_ENV === "production" || env.NODE_ENV === "staging",
    crossSubDomainCookies: {
      enabled: enableCrossSubdomainCookies,
    },
  },
});

/**
 * Type of the {@link auth} instance (infer Better Auth API surface).
 */
export type Auth = typeof auth;
