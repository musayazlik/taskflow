/**
 * @fileoverview UploadThing server integration: `UTApi` for server-side file ops and a typed `uploadRouter`.
 * @module @api/lib/uploadthing
 */

import { createUploadthing, type FileRouter, UTApi } from "uploadthing/server";
import { env } from "@api/lib/env";
import { auth } from "@api/lib/auth";
import { logger } from "@api/lib/logger";

const f = createUploadthing();

/**
 * UploadThing **UTApi** client for listing, deleting, and URL operations from server code.
 *
 * @remarks
 * - If `UPLOADTHING_TOKEN` is unset, logs a warning and constructs an instance with an empty token
 *   (operations may fail until configured).
 * - Used heavily by `media.service`.
 */
export const utapi = env.UPLOADTHING_TOKEN
  ? new UTApi({
      token: env.UPLOADTHING_TOKEN,
    })
  : (() => {
      logger.warn(
        "UPLOADTHING_TOKEN not configured. File uploads will not work. Get your token from https://uploadthing.com/dashboard",
      );
      // Return a mock instance that will fail gracefully
      return new UTApi({
        token: "",
      });
    })();

/**
 * UploadThing **FileRouter** for client-driven uploads. Each route can define middleware and completion hooks.
 *
 * `imageUploader`: single image up to 4MB; middleware requires a valid Better Auth session.
 */
export const uploadRouter: FileRouter = {
  imageUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      // UploadThing middleware receives { req }
      // req is a Request object (Web Standard)
      const request = req as Request;
      const headers = request.headers;

      // Check authentication
      const session = await auth.api.getSession({ headers });
      if (!session) {
        throw new Error("Unauthorized");
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // File upload completed successfully
      // You can add additional logic here (e.g., save to database)
      return {
        url: file.url,
        name: file.name,
        size: file.size,
      };
    }),
};

/**
 * Type of {@link uploadRouter} for UploadThing client type inference.
 */
export type OurFileRouter = typeof uploadRouter;
