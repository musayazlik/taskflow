import { Elysia, t } from "elysia";
import { AppError } from "@api/lib/errors";
import { GlobalSettingsSchema } from "@repo/types";
import { prisma } from "@repo/database";
import { successResponse } from "@api/lib/route-helpers";
import * as mediaService from "@api/services/media.service";

/**
 * Public Settings Routes
 * Landing page ve diğer public sayfalar için settings endpoint'i
 * Authentication gerektirmez, database'den settings çeker
 */
export const settingsRoutes = new Elysia({ tags: ["Settings"] })
  .get(
    "/",
    async () => {
      // Database'den global settings kaydını çek
      const settings = await prisma.globalSettings.findFirst();

      if (!settings) {
        // Eğer hiç settings yoksa null döndür
        return { success: true, data: null };
      }

      return { success: true, data: settings };
    },
    {
      detail: {
        tags: ["Settings"],
        summary: "Get settings (public)",
        description:
          "Returns settings from database (public endpoint, no authentication required). Used by landing page.",
      },
      response: t.Object({
        success: t.Boolean(),
        data: t.Union([GlobalSettingsSchema, t.Null()]),
      }),
    },
  )
  .patch(
    "/",
    async ({ body }) => {
      // Database'de settings var mı kontrol et
      let settings = await prisma.globalSettings.findFirst();

      if (!settings) {
        // Yoksa oluştur
        settings = await prisma.globalSettings.create({
          data: {
            id: "default",
            primaryColor: body.primaryColor ?? null,
            primaryForeground: body.primaryForeground ?? null,
            secondaryColor: body.secondaryColor ?? null,
            secondaryForeground: body.secondaryForeground ?? null,
          },
        });
      } else {
        // Varsa güncelle
        settings = await prisma.globalSettings.update({
          where: { id: settings.id },
          data: {
            primaryColor: body.primaryColor !== undefined ? body.primaryColor : settings.primaryColor,
            primaryForeground: body.primaryForeground !== undefined ? body.primaryForeground : settings.primaryForeground,
            secondaryColor: body.secondaryColor !== undefined ? body.secondaryColor : settings.secondaryColor,
            secondaryForeground: body.secondaryForeground !== undefined ? body.secondaryForeground : settings.secondaryForeground,
          },
        });
      }

      return { success: true, data: settings };
    },
    {
      body: t.Object({
        primaryColor: t.Optional(t.Union([t.String(), t.Null()])),
        primaryForeground: t.Optional(t.Union([t.String(), t.Null()])),
        secondaryColor: t.Optional(t.Union([t.String(), t.Null()])),
        secondaryForeground: t.Optional(t.Union([t.String(), t.Null()])),
      }),
      detail: {
        tags: ["Settings"],
        summary: "Update settings (public)",
        description:
          "Updates global settings (public endpoint, no authentication required).",
      },
      response: t.Object({
        success: t.Boolean(),
        data: GlobalSettingsSchema,
      }),
    },
  )

  // Image Optimization Settings
  .get(
    "/image-optimization",
    async () => {
      const settings = await mediaService.getImageOptimizationSettings();
      return successResponse(settings);
    },
    {
      detail: {
        tags: ["Settings"],
        summary: "Get image optimization settings (public)",
        description:
          "Returns global image optimization settings used for product image uploads. Public endpoint, no authentication required.",
      },
      response: t.Object({
        success: t.Boolean(),
        data: t.Object({
          enabled: t.Boolean(),
          maxWidth: t.Union([t.Number(), t.Null()]),
          maxHeight: t.Union([t.Number(), t.Null()]),
          quality: t.Union([t.Number(), t.Null()]),
          format: t.Union([t.String(), t.Null()]),
        }),
      }),
    },
  )
  .patch(
    "/image-optimization",
    async ({ body }) => {
      if (body.quality !== undefined && body.quality !== null) {
        if (body.quality < 1 || body.quality > 100) {
          throw new AppError(
            "VALIDATION_ERROR",
            "quality must be between 1 and 100",
            400,
          );
        }
      }

      const settings = await mediaService.updateImageOptimizationSettings(body);
      return successResponse(settings);
    },
    {
      body: t.Object({
        enabled: t.Optional(t.Boolean()),
        maxWidth: t.Optional(t.Union([t.Number(), t.Null()])),
        maxHeight: t.Optional(t.Union([t.Number(), t.Null()])),
        quality: t.Optional(t.Union([t.Number(), t.Null()])),
        format: t.Optional(t.Union([t.String(), t.Null()])),
      }),
      detail: {
        tags: ["Settings"],
        summary: "Update image optimization settings (public)",
        description:
          "Updates global image optimization settings used for product image uploads. Public endpoint, no authentication required.",
      },
      response: t.Object({
        success: t.Boolean(),
        data: t.Object({
          enabled: t.Boolean(),
          maxWidth: t.Union([t.Number(), t.Null()]),
          maxHeight: t.Union([t.Number(), t.Null()]),
          quality: t.Union([t.Number(), t.Null()]),
          format: t.Union([t.String(), t.Null()]),
        }),
      }),
    },
  )

  // Media Upload Settings
  .get(
    "/media-upload",
    async () => {
      const settings = await mediaService.getMediaUploadSettings();
      return successResponse(settings);
    },
    {
      detail: {
        tags: ["Settings"],
        summary: "Get media upload settings (public)",
        description:
          "Returns global media upload settings (max file size, allowed MIME types, etc.). Public endpoint, no authentication required.",
      },
      response: t.Object({
        success: t.Boolean(),
        data: t.Object({
          maxFileSize: t.Number(),
          maxFileCount: t.Number(),
          allowedMimeTypes: t.Array(t.String()),
        }),
      }),
    },
  )
  .patch(
    "/media-upload",
    async ({ body }) => {
      // Validate maxFileSize (1-50 MB)
      if (body.maxFileSize !== undefined) {
        if (body.maxFileSize < 1 || body.maxFileSize > 50) {
          throw new AppError(
            "VALIDATION_ERROR",
            "Max file size must be between 1 and 50 MB",
            400,
          );
        }
      }

      // Validate maxFileCount (1-50)
      if (body.maxFileCount !== undefined) {
        if (body.maxFileCount < 1 || body.maxFileCount > 50) {
          throw new AppError(
            "VALIDATION_ERROR",
            "Max file count must be between 1 and 50",
            400,
          );
        }
      }

      // Validate allowedMimeTypes
      if (body.allowedMimeTypes !== undefined) {
        const validMimeTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
          "image/svg+xml",
          "image/avif",
          "image/bmp",
          "image/tiff",
          "application/pdf",
          "video/mp4",
          "video/webm",
          "audio/mpeg",
          "audio/wav",
        ];
        const invalidTypes = body.allowedMimeTypes.filter(
          (type) => !validMimeTypes.includes(type),
        );
        if (invalidTypes.length > 0) {
          throw new AppError(
            "VALIDATION_ERROR",
            `Invalid MIME types: ${invalidTypes.join(", ")}`,
            400,
          );
        }
      }

      const settings = await mediaService.updateMediaUploadSettings(body);
      return successResponse(settings);
    },
    {
      body: t.Object({
        maxFileSize: t.Optional(t.Number()),
        maxFileCount: t.Optional(t.Number()),
        allowedMimeTypes: t.Optional(t.Array(t.String())),
      }),
      detail: {
        tags: ["Settings"],
        summary: "Update media upload settings (public)",
        description:
          "Updates global media upload settings (max file size, allowed MIME types, etc.). Public endpoint, no authentication required.",
      },
      response: t.Object({
        success: t.Boolean(),
        data: t.Object({
          maxFileSize: t.Number(),
          maxFileCount: t.Number(),
          allowedMimeTypes: t.Array(t.String()),
        }),
      }),
    },
  );
