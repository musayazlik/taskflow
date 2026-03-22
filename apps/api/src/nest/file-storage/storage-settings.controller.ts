import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";
import { prisma } from "@repo/database";

import { AppError } from "@api/lib/errors";
import { successResponse } from "@api/lib/route-helpers";
import * as mediaService from "@api/services/media.service";
import { BetterAuthGuard } from "../auth/better-auth.guard";
import { AdminGuard } from "../auth/role.guards";
import { FileProvider } from "@api/lib/file-service";

import type { StorageSettingsUpdateBody } from "./dto/storage-settings.dto";

@Controller("/api/storage-settings")
export class StorageSettingsController {
  @Get("/")
  @UseGuards(BetterAuthGuard, AdminGuard)
  async get() {
    const settings = await prisma.fileStorageSettings.findFirst();

    if (!settings) {
      return successResponse({
        defaultProvider: FileProvider.UPLOADTHING,
        providers: mediaService.getAvailableProviders(),
      });
    }

    return successResponse({
      defaultProvider: settings.defaultProvider,
      selectionRules: settings.selectionRules,
      providers: mediaService.getAvailableProviders(),
    });
  }

  @Put("/")
  @UseGuards(BetterAuthGuard, AdminGuard)
  async update(
    @Body() body: StorageSettingsUpdateBody,
  ) {
    try {
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
    } catch (error) {
      throw new AppError("STORAGE_SETTINGS_UPDATE_ERROR", "Failed to update storage settings", 500);
    }
  }
}

