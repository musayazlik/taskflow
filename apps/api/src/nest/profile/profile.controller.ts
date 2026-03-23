import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { prisma } from "@repo/database";

import * as userService from "@api/services/user.service";
import * as mediaService from "@api/services/media.service";

import { AppError } from "@api/lib/errors";
import { logger } from "@api/lib/logger";
import { BetterAuthGuard } from "../auth/better-auth.guard";

import {
  ChangePasswordSchema,
  UpdateProfileSchema,
  type ChangePassword,
  type UpdateProfile,
} from "@repo/types";
import type { RequestWithSession } from "../auth/better-auth.guard";

import { TypeBoxValidationPipe } from "../common/pipes/typebox-validation.pipe";
import { hashPassword, verifyPassword } from "better-auth/crypto";
import { FileInterceptor } from "@nestjs/platform-express";
import multer from "multer";
import { multerFileToDomFile } from "../common/utils/multer-to-file";

import type { SetPasswordBody } from "./dto/profile.dto";

@Controller("/api/profile")
@UseGuards(BetterAuthGuard)
export class ProfileController {
  @Get("/")
  async getProfile(@Req() req: RequestWithSession) {
    const session = req.betterAuthSession;
    if (!session) throw new AppError("UNAUTHORIZED", "Authentication required", 401);

    const fullUser = await userService.getUserById(session.user.id);
    if (!fullUser) {
      throw new AppError("USER_NOT_FOUND", "User not found", 404);
    }

    const { password, ...userWithoutPassword } = fullUser;
    return { success: true, data: userWithoutPassword };
  }

  @Patch("/")
  async updateProfile(
    @Req() req: RequestWithSession,
    @Body(new TypeBoxValidationPipe(UpdateProfileSchema)) body: UpdateProfile,
  ) {
    const session = req.betterAuthSession;
    if (!session) throw new AppError("UNAUTHORIZED", "Authentication required", 401);

    if ("email" in body && body.email && body.email !== session.user.email) {
      const isTaken = await userService.isEmailTaken(body.email, session.user.id);
      if (isTaken) {
        throw new AppError("EMAIL_TAKEN", "Email is already in use", 400);
      }
    }

    const updatedUser = await userService.updateUser(session.user.id, body);
    logger.info({ userId: session.user.id }, "Updated user profile");

    const { password, ...userWithoutPassword } = updatedUser;
    return { success: true, data: userWithoutPassword };
  }

  @Post("/avatar")
  @UseInterceptors(FileInterceptor("avatar", { storage: multer.memoryStorage() }))
  async uploadAvatar(
    @Req() req: RequestWithSession,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const session = req.betterAuthSession;
    if (!session) throw new AppError("UNAUTHORIZED", "Authentication required", 401);

    if (!file) throw new AppError("NO_FILE", "No file provided", 400);

    const domFile = multerFileToDomFile(file);

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(domFile.type)) {
      throw new AppError(
        "INVALID_FILE_TYPE",
        "Only JPEG, PNG, GIF, and WebP images are allowed",
        400,
      );
    }

    const maxSize = 4 * 1024 * 1024;
    if (domFile.size > maxSize) {
      throw new AppError("FILE_TOO_LARGE", "File size must be less than 4MB", 400);
    }

    const currentUser = await userService.getUserById(session.user.id);
    if (currentUser?.image) {
      try {
        await mediaService.deleteProfileImage(session.user.id);
      } catch (error) {
        logger.error({ err: error, userId: session.user.id }, "Error deleting old avatar");
      }
    }

    const result = await mediaService.uploadProfileImage(domFile, session.user.id);
    return {
      success: true,
      data: { url: result.url, message: "Avatar uploaded successfully" },
    };
  }

  @Delete("/avatar")
  async removeAvatar(@Req() req: RequestWithSession) {
    const session = req.betterAuthSession;
    if (!session) throw new AppError("UNAUTHORIZED", "Authentication required", 401);

    await mediaService.deleteProfileImage(session.user.id);
    return { success: true, message: "Avatar removed successfully" };
  }

  @Get("/has-password")
  async hasPassword(@Req() req: RequestWithSession) {
    const session = req.betterAuthSession;
    if (!session) throw new AppError("UNAUTHORIZED", "Authentication required", 401);

    const account = await prisma.account.findFirst({
      where: { userId: session.user.id, providerId: "credential" },
    });

    return {
      success: true,
      data: { hasPassword: !!account?.password },
    };
  }

  @Post("/set-password")
  async setPassword(
    @Req() req: RequestWithSession,
    @Body() body: SetPasswordBody,
  ) {
    const session = req.betterAuthSession;
    if (!session) throw new AppError("UNAUTHORIZED", "Authentication required", 401);

    const { newPassword } = body;
    if (!newPassword || newPassword.length < 8) {
      throw new AppError("VALIDATION_ERROR", "newPassword must be at least 8 chars", 400);
    }

    const existingAccount = await prisma.account.findFirst({
      where: { userId: session.user.id, providerId: "credential" },
    });

    if (existingAccount?.password) {
      throw new AppError(
        "PASSWORD_EXISTS",
        "You already have a password set. Use change password instead.",
        400,
      );
    }

    const hashedPassword = await hashPassword(newPassword);

    if (existingAccount) {
      await prisma.account.update({
        where: { id: existingAccount.id },
        data: { password: hashedPassword },
      });
    } else {
      await prisma.account.create({
        data: {
          accountId: session.user.id,
          providerId: "credential",
          userId: session.user.id,
          password: hashedPassword,
        },
      });
    }

    return { success: true, message: "Password set successfully" };
  }

  @Post("/change-password")
  async changePassword(
    @Req() req: RequestWithSession,
    @Body(new TypeBoxValidationPipe(ChangePasswordSchema)) body: ChangePassword,
  ) {
    const session = req.betterAuthSession;
    if (!session) throw new AppError("UNAUTHORIZED", "Authentication required", 401);

    const account = await prisma.account.findFirst({
      where: { userId: session.user.id, providerId: "credential" },
    });

    if (!account || !account.password) {
      throw new AppError(
        "NO_PASSWORD",
        "No password set for this account. Use 'Set Password' instead.",
        400,
      );
    }

    const isValid = await verifyPassword({
      hash: account.password,
      password: body.currentPassword,
    });

    if (!isValid) {
      throw new AppError("INVALID_PASSWORD", "Current password is incorrect", 400);
    }

    const hashedPassword = await hashPassword(body.newPassword);
    await prisma.account.update({
      where: { id: account.id },
      data: { password: hashedPassword },
    });

    return { success: true, message: "Password changed successfully" };
  }
}
