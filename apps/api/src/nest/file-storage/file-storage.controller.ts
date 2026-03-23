import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import multer from "multer";

import { AppError } from "@api/lib/errors";
import { successResponse } from "@api/lib/route-helpers";
import * as mediaService from "@api/services/media.service";
import { BetterAuthGuard } from "../auth/better-auth.guard";
import { AdminGuard } from "../auth/role.guards";
import type { RequestWithSession } from "../auth/better-auth.guard";
import { FILE_UPLOAD_LIMITS } from "@api/constants";
import { parseQueryInt } from "@api/lib/parse-query-int";
import { multerFileToDomFile } from "../common/utils/multer-to-file";

import type {
  FileStorageListQuery,
  FileStorageUploadBody,
  MigrateFileBody,
} from "./dto/file-storage.dto";

@Controller("/api/file-storage")
export class FileStorageController {
  @Get("/files")
  @UseGuards(BetterAuthGuard, AdminGuard)
  async listFiles(
    @Query() query: FileStorageListQuery,
  ) {
    const limit = parseQueryInt(query.limit, 50, { min: 1, max: 500 });
    const offset = parseQueryInt(query.offset, 0, { min: 0, max: 1_000_000 });
    const folder = query.folder;

    const result = await mediaService.listFiles({ limit, offset, folder });
    return successResponse(result);
  }

  @Get("/files/:key")
  @UseGuards(BetterAuthGuard, AdminGuard)
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
    body?: FileStorageUploadBody,
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
    @Req() req: RequestWithSession,
    @Param("key") key: string,
  ) {
    const session = req.betterAuthSession;
    if (!session) {
      throw new AppError("UNAUTHORIZED", "Authentication required", 401);
    }

    await mediaService.deleteFile(key, {
      userId: session.user.id,
      role: session.user.role,
    });
    return successResponse(null, "File deleted successfully");
  }

  @Post("/files/:key/migrate")
  @UseGuards(BetterAuthGuard)
  async migrateFile(
    @Req() req: RequestWithSession,
    @Param("key") key: string,
    @Body() body: MigrateFileBody,
  ) {
    const session = req.betterAuthSession;
    if (!session) {
      throw new AppError("UNAUTHORIZED", "Authentication required", 401);
    }

    const result = await mediaService.migrateFile(key, body.targetProvider, {
      userId: session.user.id,
      role: session.user.role,
    });
    return successResponse(result, "File migrated successfully");
  }

  @Get("/providers")
  @UseGuards(BetterAuthGuard, AdminGuard)
  async providers() {
    const providers = mediaService.getAvailableProviders();
    return successResponse(providers);
  }
}

