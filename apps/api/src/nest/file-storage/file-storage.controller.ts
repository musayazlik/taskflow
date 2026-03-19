import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import multer from "multer";

import { prisma } from "@repo/database";
import { AppError } from "@api/lib/errors";
import { successResponse } from "@api/lib/route-helpers";
import * as mediaService from "@api/services/media.service";
import { BetterAuthGuard } from "../auth/better-auth.guard";
import type { RequestWithSession } from "../auth/better-auth.guard";
import { FileProvider } from "@api/lib/file-service";
import { FILE_UPLOAD_LIMITS, PAGINATION } from "@api/constants";
import { multerFileToDomFile } from "../utils/multer-to-file";

@Controller("/api/file-storage")
export class FileStorageController {
  @Get("/files")
  async listFiles(
    @Query() query: { limit?: string; offset?: string; folder?: string },
  ) {
    const limit = query.limit ? parseInt(query.limit) : 50;
    const offset = query.offset ? parseInt(query.offset) : 0;
    const folder = query.folder;

    const result = await mediaService.listFiles({ limit, offset, folder });
    return successResponse(result);
  }

  @Get("/files/:key")
  async getFile(@Param("key") key: string) {
    const file = await mediaService.getFile(key);
    return successResponse(file);
  }

  @Post("/upload")
  @UseGuards(BetterAuthGuard)
  @UseInterceptors(
    FileInterceptor("file", {
      storage: multer.memoryStorage(),
    }),
  )
  async uploadFile(
    @Req() req: RequestWithSession,
    @UploadedFile() file?: Express.Multer.File,
    @Body()
    body?: {
      folder?: string;
      provider?: FileProvider;
      metadata?: Record<string, string>;
    },
  ) {
    const session = req.betterAuthSession;
    if (!session) throw new AppError("UNAUTHORIZED", "Authentication required", 401);

    if (!file) {
      throw new AppError("VALIDATION_ERROR", "File is required", 400);
    }

    const domFile = multerFileToDomFile(file);

    if (domFile.size > FILE_UPLOAD_LIMITS.MAX_SIZE_BYTES) {
      throw new AppError(
        "FILE_TOO_LARGE",
        `File size must be less than ${FILE_UPLOAD_LIMITS.MAX_SIZE_MB}MB`,
        400,
      );
    }

    const result = await mediaService.uploadFile(
      {
        file: domFile,
        folder: body?.folder,
        preferredProvider: body?.provider,
        metadata: body?.metadata,
      },
      session.user.id,
    );

    return successResponse(result, "File uploaded successfully");
  }

  @Delete("/files/:key")
  @UseGuards(BetterAuthGuard)
  async deleteFile(
    @Param("key") key: string,
  ) {
    await mediaService.deleteFile(key);
    return successResponse(null, "File deleted successfully");
  }

  @Post("/files/:key/migrate")
  @UseGuards(BetterAuthGuard)
  async migrateFile(
    @Param("key") key: string,
    @Body() body: { targetProvider: FileProvider },
  ) {
    const result = await mediaService.migrateFile(key, body.targetProvider);
    return successResponse(result, "File migrated successfully");
  }

  @Get("/providers")
  async providers() {
    const providers = mediaService.getAvailableProviders();
    return successResponse(providers);
  }
}

