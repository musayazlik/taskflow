/**
 * File Storage Routes
 * Multi-provider file management API with dependency injection
 */

import { Elysia, t } from "elysia";
import { FileProvider, FileUploadService } from "@api/lib/file-service";
import * as mediaService from "@api/services/media.service";
import { requireAuth, successResponse } from "@api/lib/route-helpers";
import { prisma } from "@repo/database";

// TypeBox schemas
const FileProviderEnum = t.Enum(FileProvider);

export const fileStorageRoutes = new Elysia({ prefix: "/file-storage" })
  // Inject file upload service into context
  .derive(({ headers }) => ({
    get fileService() {
      return FileUploadService;
    },
    async getUser() {
      // Simplified auth - use actual auth in production
      return { id: "user-id" };
    },
  }))

  // List files
  .get(
    "/files",
    async ({ query }) => {
      const result = await mediaService.listFiles({
        limit: query.limit ? parseInt(query.limit) : 50,
        offset: query.offset ? parseInt(query.offset) : 0,
        folder: query.folder,
      });

      return successResponse(result);
    },
    {
      query: t.Object({
        limit: t.Optional(t.String()),
        offset: t.Optional(t.String()),
        folder: t.Optional(t.String()),
      }),
      detail: {
        tags: ["File Storage"],
        summary: "List uploaded files",
      },
    }
  )

  // Get file details
  .get(
    "/files/:key",
    async ({ params }) => {
      const file = await mediaService.getFile(params.key);
      return successResponse(file);
    },
    {
      params: t.Object({
        key: t.String(),
      }),
      detail: {
        tags: ["File Storage"],
        summary: "Get file details",
      },
    }
  )

  // Upload file
  .post(
    "/upload",
    async ({ body, request }) => {
      const session = await requireAuth(request.headers);

      const result = await mediaService.uploadFile(
        {
          file: body.file,
          folder: body.folder,
          preferredProvider: body.provider,
          metadata: body.metadata,
        },
        session.user.id
      );

      return successResponse(result, "File uploaded successfully");
    },
    {
      body: t.Object({
        file: t.File(),
        folder: t.Optional(t.String()),
        provider: t.Optional(FileProviderEnum),
        metadata: t.Optional(t.Record(t.String(), t.String())),
      }),
      detail: {
        tags: ["File Storage"],
        summary: "Upload a file",
      },
    }
  )

  // Delete file
  .delete(
    "/files/:key",
    async ({ params, request }) => {
      await requireAuth(request.headers);
      await mediaService.deleteFile(params.key);
      return successResponse(null, "File deleted successfully");
    },
    {
      params: t.Object({
        key: t.String(),
      }),
      detail: {
        tags: ["File Storage"],
        summary: "Delete a file",
      },
    }
  )

  // Migrate file to another provider
  .post(
    "/files/:key/migrate",
    async ({ params, body, request }) => {
      await requireAuth(request.headers);
      const result = await mediaService.migrateFile(params.key, body.targetProvider);
      return successResponse(result, "File migrated successfully");
    },
    {
      params: t.Object({
        key: t.String(),
      }),
      body: t.Object({
        targetProvider: FileProviderEnum,
      }),
      detail: {
        tags: ["File Storage"],
        summary: "Migrate file to another provider",
      },
    }
  )

  // Get available providers
  .get(
    "/providers",
    async () => {
      const providers = mediaService.getAvailableProviders();
      return successResponse(providers);
    },
    {
      detail: {
        tags: ["File Storage"],
        summary: "Get available storage providers",
      },
    }
  );

// Storage settings routes
export const storageSettingsRoutes = new Elysia({ prefix: "/storage-settings" })
  .get(
    "/",
    async () => {
      const settings = await prisma.fileStorageSettings.findFirst();
      if (!settings) {
        return successResponse({
          defaultProvider: FileProvider.UPLOADTHING,
          providers: mediaService.getAvailableProviders(),
        });
      }

      // Return without sensitive data
      return successResponse({
        defaultProvider: settings.defaultProvider,
        selectionRules: settings.selectionRules,
        providers: mediaService.getAvailableProviders(),
      });
    },
    {
      detail: {
        tags: ["Storage Settings"],
        summary: "Get storage settings",
      },
    }
  )

  .put(
    "/",
    async ({ body, request }) => {
      await requireAuth(request.headers);

      const settings = await prisma.fileStorageSettings.upsert({
        where: { id: "default" },
        create: {
          id: "default",
          defaultProvider: body.defaultProvider,
          uploadthingToken: body.uploadthingToken,
          selectionRules: body.selectionRules,
        },
        update: {
          defaultProvider: body.defaultProvider,
          ...(body.uploadthingToken && { uploadthingToken: body.uploadthingToken }),
          ...(body.selectionRules && { selectionRules: body.selectionRules }),
        },
      });

      return successResponse(settings);
    },
    {
      body: t.Object({
        defaultProvider: FileProviderEnum,
        uploadthingToken: t.Optional(t.String()),
        selectionRules: t.Optional(t.Record(t.String(), t.String())),
      }),
      detail: {
        tags: ["Storage Settings"],
        summary: "Update storage settings",
      },
    }
  );
