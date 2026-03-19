import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";

import { AppError } from "@api/lib/errors";
import { logger } from "@api/lib/logger";
import { generateRandomPassword } from "@api/lib/utils";
import { sendWelcomeEmail } from "@api/emails";
import { env } from "@api/lib/env";
import { PAGINATION } from "@api/constants";
import { BetterAuthGuard } from "../auth/better-auth.guard";
import { AdminGuard } from "../auth/role.guards";
import type { RequestWithSession } from "../auth/better-auth.guard";

import * as userService from "@api/services/user.service";
import { auth } from "@api/lib/auth";

import type { UpdateUserData, UserListParams } from "@repo/types";

type UserQuery = {
  page?: string;
  limit?: string;
  search?: string;
  role?: string;
};

type UpdateUserBody = Partial<{
  name: string;
  email: string;
  image: string;
}>;

type BulkIdsBody = {
  ids: string[];
};

type CreateUserBody = {
  email: string;
  name: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  password: string;
};

@Controller("/api/users")
@UseGuards(BetterAuthGuard, AdminGuard)
export class AdminUsersController {
  @Get("/")
  async listUsers(@Query() query: UserQuery, @Req() req: RequestWithSession) {
    const params: UserListParams = {
      page: query.page ? parseInt(query.page) : PAGINATION.DEFAULT_PAGE,
      limit: query.limit ? parseInt(query.limit) : PAGINATION.DEFAULT_LIMIT,
      search: query.search,
      role: query.role as UserListParams["role"],
    };

    const result = await userService.getAllUsers(params);
    return {
      success: true,
      data: result.users,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  @Get("/:id")
  async getUserById(@Param("id") id: string) {
    const user = await userService.getUserById(id);
    if (!user) {
      throw new AppError("USER_NOT_FOUND", "User not found", 404);
    }

    const { password, ...userWithoutPassword } = user;
    return { success: true, data: userWithoutPassword };
  }

  @Patch("/:id")
  async updateUser(
    @Param("id") id: string,
    @Body() body: UpdateUserBody,
  ) {
    const user = await userService.updateUser(id, body as UpdateUserData);
    const { password, ...userWithoutPassword } = user;
    return { success: true, data: userWithoutPassword };
  }

  @Delete("/:id")
  async deleteUser(
    @Param("id") id: string,
    @Req() req: RequestWithSession,
  ) {
    const currentUserId = req.betterAuthSession?.user.id;
    if (!currentUserId) {
      throw new AppError("UNAUTHORIZED", "Authentication required", 401);
    }

    if (id === currentUserId) {
      throw new AppError(
        "INVALID_OPERATION",
        "Cannot delete your own account from admin panel",
        400,
      );
    }

    await userService.deleteUser(id);
    return { success: true, message: "User deleted successfully" };
  }

  @Post("/bulk-delete")
  async bulkDelete(
    @Body() body: BulkIdsBody,
    @Req() req: RequestWithSession,
  ) {
    const { ids } = body;
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new AppError("VALIDATION_ERROR", "ids array is required", 400);
    }

    const currentUserId = req.betterAuthSession?.user.id;
    if (!currentUserId) {
      throw new AppError("UNAUTHORIZED", "Authentication required", 401);
    }

    if (ids.includes(currentUserId)) {
      throw new AppError(
        "INVALID_OPERATION",
        "Cannot delete your own account",
        400,
      );
    }

    let deleted = 0;
    let failed = 0;

    for (const id of ids) {
      try {
        await userService.deleteUser(id);
        deleted++;
      } catch {
        failed++;
      }
    }

    return {
      success: true,
      message: `${deleted} users deleted${failed > 0 ? `, ${failed} failed` : ""}`,
      deleted,
      failed,
    };
  }

  @Post("/bulk-verify")
  async bulkVerify(@Body() body: BulkIdsBody) {
    const { ids } = body;
    let verified = 0;
    let failed = 0;

    for (const id of ids) {
      try {
        await userService.verifyUserEmail(id);
        verified++;
      } catch {
        failed++;
      }
    }

    return {
      success: true,
      message: `${verified} users verified${failed > 0 ? `, ${failed} failed` : ""}`,
      verified,
      failed,
    };
  }

  @Post("/bulk-unverify")
  async bulkUnverify(@Body() body: BulkIdsBody) {
    const { ids } = body;
    let unverified = 0;
    let failed = 0;

    for (const id of ids) {
      try {
        await userService.unverifyUserEmail(id);
        unverified++;
      } catch {
        failed++;
      }
    }

    return {
      success: true,
      message: `${unverified} users deactivated${failed > 0 ? `, ${failed} failed` : ""}`,
      unverified,
      failed,
    };
  }

  @Post("/create")
  async createUser(@Body() body: CreateUserBody) {
    const result = await userService.adminCreateUser({
      email: body.email,
      name: body.name,
      role: body.role,
      password: body.password,
    });

    const loginUrl = `${env.FRONTEND_URL}/login`;
    logger.info({ email: result.user.email }, "Sending welcome email");
    try {
      await sendWelcomeEmail({
        to: result.user.email,
        userName: result.user.name || undefined,
        tempPassword: result.password,
        loginUrl,
      });
      logger.info(
        { email: result.user.email },
        "Welcome email sent successfully",
      );
    } catch (error) {
      logger.error(
        { err: error, email: result.user.email },
        "Failed to send welcome email",
      );
    }

    const { password, ...userWithoutPassword } = result.user;
    return {
      success: true,
      data: userWithoutPassword,
      message: "User created successfully. Welcome email sent.",
    };
  }

  @Get("/generate-password")
  async generatePassword() {
    const password = generateRandomPassword();
    return {
      success: true,
      data: { password },
    };
  }

  @Post("/:id/send-password-reset")
  async sendPasswordReset(
    @Param("id") id: string,
    @Req() req: RequestWithSession,
  ) {
    const _ = req.betterAuthSession;
    if (!_) {
      throw new AppError("UNAUTHORIZED", "Authentication required", 401);
    }

    const user = await userService.getUserById(id);
    if (!user) {
      throw new AppError("USER_NOT_FOUND", "User not found", 404);
    }

    try {
      logger.info({ email: user.email }, "Triggering password reset for user");
      await auth.api.requestPasswordReset({
        body: {
          email: user.email,
          redirectTo: `${env.FRONTEND_URL}/reset-password`,
        },
      });
    } catch (error) {
      logger.error(
        { err: error, email: user.email },
        "Failed to send password reset email",
      );
      throw new AppError(
        "EMAIL_SEND_ERROR",
        "Failed to send password reset email",
        500,
      );
    }

    return {
      success: true,
      message: "Password reset email sent successfully",
    };
  }

  @Post("/:id/verify-email")
  async verifyEmail(@Param("id") id: string) {
    const user = await userService.verifyUserEmail(id);
    const { password, ...userWithoutPassword } = user;
    return {
      success: true,
      data: userWithoutPassword,
      message: "User email verified successfully",
    };
  }

  @Post("/:id/unverify-email")
  async unverifyEmail(@Param("id") id: string) {
    const user = await userService.unverifyUserEmail(id);
    const { password, ...userWithoutPassword } = user;
    return {
      success: true,
      data: userWithoutPassword,
      message: "User email unverified successfully",
    };
  }
}

