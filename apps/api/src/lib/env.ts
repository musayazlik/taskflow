import { config } from "dotenv";
import { resolve } from "path";
import { z } from "zod";
import { logger } from "./logger";

// Load .env from stable absolute paths so imports work regardless of CWD.
const rootEnvPath = resolve(import.meta.dir, "../../../../.env");
const apiEnvPath = resolve(import.meta.dir, "../../.env");

// Root first, then api-level overrides (if both exist).
config({ path: rootEnvPath });
config({ path: apiEnvPath });

/**
 * Environment variable validation schema
 * App will fail fast if any required env var is missing or invalid
 */
const envSchema = z.object({
  // Environment
  NODE_ENV: z
    .enum(["development", "staging", "test", "production"])
    .default("development"),

  // Server
  PORT: z.coerce.number().default(4101),
  FRONTEND_URL: z.string().default("http://localhost:4100"),

  // Better Auth
  BETTER_AUTH_SECRET: z.string().optional(),
  BETTER_AUTH_URL: z.string().url().optional(),

  // Database
  DATABASE_URL: z.string().url(),

  // Email (Resend)
  RESEND_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),

  // OAuth (optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  // AI (optional)
  OPENROUTER_API_KEY: z.string().optional(),

  // File Upload (optional)
  // UploadThing token format: base64 encoded JSON with { apiKey, appId, regions }
  // Get your token from: https://uploadthing.com/dashboard
  // Example: eyJhcGlLZXkiOiIuLi4iLCJhcHBJZCI6Ii4uLiIsInJlZ2lvbnMiOlsiLi4uIl19
  UPLOADTHING_TOKEN: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true; // Optional, so empty is OK
        // UploadThing v6+ requires base64 encoded JSON token
        // Check if it's a valid base64 string (length multiple of 4, or padded)
        const padded = val + "=".repeat((4 - (val.length % 4)) % 4);
        try {
          // Try to decode and parse as JSON
          const decoded = Buffer.from(padded, "base64").toString("utf-8");
          const parsed = JSON.parse(decoded);
          // Should have apiKey, appId, and regions
          return (
            typeof parsed.apiKey === "string" &&
            typeof parsed.appId === "string" &&
            Array.isArray(parsed.regions)
          );
        } catch (e) {
          // If validation fails, log helpful error
          logger.error(
            {
              tokenLength: val.length,
              error: e instanceof Error ? e.message : String(e),
            },
            "UPLOADTHING_TOKEN validation failed! Token format must be base64 encoded JSON: { apiKey: string, appId: string, regions: string[] }. Get your token from https://uploadthing.com/dashboard",
          );
          return false;
        }
      },
      {
        message:
          "UPLOADTHING_TOKEN must be a base64 encoded JSON object matching { apiKey: string, appId: string, regions: string[] }. Get your token from https://uploadthing.com/dashboard",
      },
    ),
});

// Validate on import - fails fast if invalid
const _env = envSchema.parse(process.env);

if (
  (_env.NODE_ENV === "production" || _env.NODE_ENV === "staging") &&
  !_env.BETTER_AUTH_SECRET
) {
  throw new Error(
    "BETTER_AUTH_SECRET is required when NODE_ENV is production or staging",
  );
}

export const env = _env;

// Type export
export type Env = z.infer<typeof envSchema>;
