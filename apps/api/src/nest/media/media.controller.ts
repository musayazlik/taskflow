import {
  Body,
  Controller,
  Delete,
  Get,
  UploadedFile,
  UploadedFiles,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import multer from "multer";

import { AppError } from "@api/lib/errors";
import { BetterAuthGuard } from "../auth/better-auth.guard";
import type { RequestWithSession } from "../auth/better-auth.guard";
import { AdminGuard } from "../auth/role.guards";

import { MEDIA_UPLOAD_DEFAULTS, PAGINATION } from "@api/constants";
import * as mediaService from "@api/services/media.service";
import { successResponse } from "@api/lib/route-helpers";
import {
  multerFileToDomFile,
  multerFilesToDomFiles,
} from "../common/utils/multer-to-file";

import type { MediaListQuery, OptimizeImageBody } from "./dto/media.dto";
import { parseQueryInt } from "@api/lib/parse-query-int";

@Controller("/api/media")
@UseGuards(BetterAuthGuard, AdminGuard)
export class MediaController {
  @Get("/")
  async list(
    @Query() query: MediaListQuery,
  ) {
    const limit = parseQueryInt(query.limit, PAGINATION.DEFAULT_LIMIT, {
      min: 1,
      max: 200,
    });
    const offset = parseQueryInt(query.offset, PAGINATION.DEFAULT_OFFSET, {
      min: 0,
      max: 1_000_000,
    });

    const result = await mediaService.listFiles({ limit, offset });
    return {
      success: true,
      data: result.files,
      pagination: {
        limit,
        offset,
        hasMore: result.hasMore,
      },
    };
  }

  @Post("/upload/single")
  @UseInterceptors(
    FileInterceptor("file", { storage: multer.memoryStorage() }),
  )
  async uploadSingle(
    @Req() req: RequestWithSession,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const session = req.betterAuthSession;
    if (!session) throw new AppError("UNAUTHORIZED", "Authentication required", 401);

    if (!file) throw new AppError("VALIDATION_ERROR", "File is required", 400);

    const domFile = multerFileToDomFile(file);
    const result = await mediaService.uploadFile({ file: domFile }, session.user.id);
    return successResponse(result, "File uploaded successfully");
  }

  @Delete("/:key")
  async deleteFile(@Req() req: RequestWithSession, @Param("key") key: string) {
    const session = req.betterAuthSession;
    if (!session) {
      throw new AppError("UNAUTHORIZED", "Authentication required", 401);
    }

    await mediaService.deleteFile(key, {
      userId: session.user.id,
      role: session.user.role,
    });
    return { success: true, message: "File deleted successfully" };
  }

  @Post("/sync")
  async sync() {
    const result = await mediaService.syncFilesFromUploadThing();
    return {
      success: true,
      message: `Synced: +${result.added} added, -${result.removed} removed`,
      data: result,
    };
  }

  @Post("/:key/optimize")
  async optimize(
    @Param("key") key: string,
    @Body() body: OptimizeImageBody,
  ) {
    const result = await mediaService.optimizeImage(key, {
      quality: body.quality,
      format: body.format,
      maxWidth: body.maxWidth,
      maxHeight: body.maxHeight,
    });
    return successResponse(result, "Image optimized successfully");
  }

  @Post("/upload")
  @UseInterceptors(
    FilesInterceptor("files", MEDIA_UPLOAD_DEFAULTS.MAX_FILE_COUNT, {
      storage: multer.memoryStorage(),
    }),
  )
  async uploadMany(
    @Req() req: RequestWithSession,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const session = req.betterAuthSession;
    if (!session) throw new AppError("UNAUTHORIZED", "Authentication required", 401);

    if (!files || files.length === 0) {
      throw new AppError("VALIDATION_ERROR", "No files provided", 400);
    }

    try {
      const domFiles = multerFilesToDomFiles(files);
      const uploadResults = await Promise.all(
        domFiles.map(async (file) => {
          const result = await mediaService.uploadFile({ file }, session.user.id);
          return {
            id: result.id,
            name: result.name,
            size: result.size,
            key: result.key,
            url: result.url,
            type: result.mimeType,
            uploadedAt: new Date().getTime(),
          };
        }),
      );
      return uploadResults;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("UPLOAD_ERROR", "Failed to upload files", 500);
    }
  }
}

