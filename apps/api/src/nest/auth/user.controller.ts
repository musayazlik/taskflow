import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { BetterAuthGuard } from "./better-auth.guard";
import type { RequestWithSession } from "./better-auth.guard";
import { AppError } from "@api/lib/errors";
import { logger } from "@api/lib/logger";

import type { UpdateUserData } from "@repo/types";
import { UpdateUserSchema } from "@repo/types";
import * as userService from "@api/services/user.service";
import { Req } from "@nestjs/common";
import { TypeBoxValidationPipe } from "../validation/typebox-validation.pipe";

@Controller("/api/user")
export class UserController {
  @Get("/me")
  @UseGuards(BetterAuthGuard)
  async getMe(@Req() req: RequestWithSession) {
    const session = req.betterAuthSession;
    if (!session) {
      throw new AppError("UNAUTHORIZED", "Authentication required", 401);
    }

    const fullUser = await userService.getUserById(session.user.id);
    if (!fullUser) {
      throw new AppError("USER_NOT_FOUND", "User not found", 404);
    }

    const { password, ...safeUser } = fullUser;
    return { success: true, data: safeUser };
  }

  @Patch("/me")
  @UseGuards(BetterAuthGuard)
  async updateMe(
    @Req() req: RequestWithSession,
    @Body(new TypeBoxValidationPipe(UpdateUserSchema)) body: Partial<UpdateUserData>,
  ) {
    const session = req.betterAuthSession;
    if (!session) {
      throw new AppError("UNAUTHORIZED", "Authentication required", 401);
    }

    const updated = await userService.updateUser(
      session.user.id,
      body as UpdateUserData,
    );

    const { password, ...safeUser } = updated;
    return { success: true, data: safeUser };
  }

  @Delete("/me")
  @UseGuards(BetterAuthGuard)
  async deleteMe(@Req() req: RequestWithSession) {
    const session = req.betterAuthSession;
    if (!session) {
      throw new AppError("UNAUTHORIZED", "Authentication required", 401);
    }

    await userService.deleteUser(session.user.id);
    logger.info({ userId: session.user.id }, "Account deleted successfully");
    return { success: true, message: "Account deleted successfully" };
  }
}

