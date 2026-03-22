/**
 * @fileoverview UploadThing server integration: shared **`UTApi`** (`utapi`) for server-side file operations.
 * @module @api/lib/uploadthing
 */

import { UTApi } from "uploadthing/server";
import { env } from "@api/lib/env";
import { logger } from "@api/lib/logger";

/**
 * UploadThing **UTApi** client for listing, deleting, and URL operations from server code.
 *
 * @remarks
 * - If `UPLOADTHING_TOKEN` is unset, logs a warning and constructs an instance with an empty token
 *   (operations may fail until configured).
 * - Used by `media.service` and `UploadThingProvider` in `@api/lib/file-service`.
 *
 * For client-driven UploadThing uploads (e.g. React `UploadButton`), define a **FileRouter** in the frontend app
 * and mount UploadThing’s route handler there — this module only exposes the shared `utapi` used by services.
 */
export const utapi = env.UPLOADTHING_TOKEN
  ? new UTApi({
      token: env.UPLOADTHING_TOKEN,
    })
  : (() => {
      logger.warn(
        "UPLOADTHING_TOKEN not configured. File uploads will not work. Get your token from https://uploadthing.com/dashboard",
      );
      return new UTApi({
        token: "",
      });
    })();
