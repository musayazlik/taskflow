import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";

import { prisma } from "@repo/database";
import { AppError } from "@api/lib/errors";
import { successResponse } from "@api/lib/route-helpers";
import * as mediaService from "@api/services/media.service";
import { BetterAuthGuard } from "../auth/better-auth.guard";
import { AdminGuard } from "../auth/role.guards";

import type {
  UpdateGlobalSettingsBody,
  UpdateImageOptimizationBody,
  UpdateMediaUploadBody,
} from "./dto/settings.dto";

@Controller("/api/settings")
export class SettingsController {
  @Get("/")
  async getSettings() {
    const settings = await prisma.globalSettings.findFirst();
    if (!settings) {
      return { success: true, data: null };
    }
    return { success: true, data: settings };
  }

  @Patch("/")
  @UseGuards(BetterAuthGuard, AdminGuard)
  async updateSettings(@Body() body: UpdateGlobalSettingsBody) {
    let settings = await prisma.globalSettings.findFirst();

    if (!settings) {
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
      settings = await prisma.globalSettings.update({
        where: { id: settings.id },
        data: {
          primaryColor:
            body.primaryColor !== undefined ? body.primaryColor : settings.primaryColor,
          primaryForeground:
            body.primaryForeground !== undefined
              ? body.primaryForeground
              : settings.primaryForeground,
          secondaryColor:
            body.secondaryColor !== undefined
              ? body.secondaryColor
              : settings.secondaryColor,
          secondaryForeground:
            body.secondaryForeground !== undefined
              ? body.secondaryForeground
              : settings.secondaryForeground,
        },
      });
    }

    return { success: true, data: settings };
  }

  @Get("/image-optimization")
  @UseGuards(BetterAuthGuard, AdminGuard)
  async getImageOptimization() {
    const settings = await mediaService.getImageOptimizationSettings();
    return successResponse(settings);
  }

  @Patch("/image-optimization")
  @UseGuards(BetterAuthGuard, AdminGuard)
  async updateImageOptimization(
    @Body() body: UpdateImageOptimizationBody,
  ) {
    if (body.quality !== undefined && body.quality !== null) {
      if (body.quality < 1 || body.quality > 100) {
        throw new AppError(
          "VALIDATION_ERROR",
          "quality must be between 1 and 100",
          400,
        );
      }
    }

    const settings = await mediaService.updateImageOptimizationSettings(
      body,
    );
    return successResponse(settings);
  }

  @Get("/media-upload")
  @UseGuards(BetterAuthGuard, AdminGuard)
  async getMediaUploadSettings() {
    const settings = await mediaService.getMediaUploadSettings();
    return successResponse(settings);
  }

  @Patch("/media-upload")
  @UseGuards(BetterAuthGuard, AdminGuard)
  async updateMediaUploadSettings(@Body() body: UpdateMediaUploadBody) {
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

    if (body.maxFileSize !== undefined) {
      if (body.maxFileSize < 1 || body.maxFileSize > 50) {
        throw new AppError(
          "VALIDATION_ERROR",
          "Max file size must be between 1 and 50 MB",
          400,
        );
      }
    }

    if (body.maxFileCount !== undefined) {
      if (body.maxFileCount < 1 || body.maxFileCount > 50) {
        throw new AppError(
          "VALIDATION_ERROR",
          "Max file count must be between 1 and 50",
          400,
        );
      }
    }

    if (body.allowedMimeTypes !== undefined) {
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
  }
}

