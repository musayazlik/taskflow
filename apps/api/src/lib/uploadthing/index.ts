/**
 * @fileoverview UploadThing server integration: shared **`UTApi`** for server-side file operations.
 * Effective token: non-empty `FileStorageSettings.uploadthingToken` overrides `UPLOADTHING_TOKEN`.
 * @module @api/lib/uploadthing
 */

import { UTApi } from "uploadthing/server";
import { prisma } from "@repo/database";
import { env } from "@api/lib/env";
import { logger } from "@api/lib/logger";

/** Loaded from DB by {@link refreshUploadthingTokenCache}; `undefined` means not loaded yet. */
let cachedDbUploadthingToken: string | null | undefined;

let cachedUtapi: UTApi | null = null;
let cachedUtapiTokenKey: string | null = null;

function getEffectiveUploadthingTokenSync(): string | null {
  if (cachedDbUploadthingToken !== undefined) {
    const fromDb = cachedDbUploadthingToken;
    if (fromDb && fromDb.trim().length > 0) {
      return fromDb;
    }
    return env.UPLOADTHING_TOKEN ?? null;
  }
  return env.UPLOADTHING_TOKEN ?? null;
}

/**
 * Whether UploadThing has a usable token (env and/or DB after {@link refreshUploadthingTokenCache}).
 */
export function isUploadthingConfigured(): boolean {
  const token = getEffectiveUploadthingTokenSync();
  return !!token?.trim();
}

/**
 * Reloads `uploadthingToken` from `FileStorageSettings`. Call after admin storage updates and during API bootstrap.
 */
export async function refreshUploadthingTokenCache(): Promise<void> {
  const row = await prisma.fileStorageSettings.findFirst();
  cachedDbUploadthingToken = row?.uploadthingToken ?? null;
  cachedUtapi = null;
  cachedUtapiTokenKey = null;
}

/**
 * Shared `UTApi` for uploads, deletes, and URL helpers using the effective token.
 */
export function getUtapi(): UTApi {
  const token = getEffectiveUploadthingTokenSync() ?? "";
  if (cachedUtapi && cachedUtapiTokenKey === token) {
    return cachedUtapi;
  }
  if (!token) {
    logger.warn(
      "UploadThing token not configured (set UPLOADTHING_TOKEN or storage settings uploadthingToken). File uploads will not work. Get your token from https://uploadthing.com/dashboard",
    );
  }
  cachedUtapi = new UTApi({ token });
  cachedUtapiTokenKey = token;
  return cachedUtapi;
}
