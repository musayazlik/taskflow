import { Controller, Get, Param, Patch, Req, UseGuards } from "@nestjs/common";

import { AppError } from "@api/lib/errors";
import { successResponse } from "@api/lib/route-helpers";
import { BetterAuthGuard } from "../auth/better-auth.guard";
import type { RequestWithSession } from "../auth/better-auth.guard";
import { NotificationsService } from "./notifications.service";

@Controller("/api/notifications")
@UseGuards(BetterAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get("/")
  async list(@Req() req: RequestWithSession) {
    const session = req.betterAuthSession;
    if (!session) throw new AppError("UNAUTHORIZED", "Authentication required", 401);

    const notifications = await this.notificationsService.listByUser(session.user.id);
    return successResponse({ notifications });
  }

  @Patch("/:id/read")
  async markRead(
    @Req() req: RequestWithSession,
    @Param("id") id: string,
  ) {
    const session = req.betterAuthSession;
    if (!session) throw new AppError("UNAUTHORIZED", "Authentication required", 401);

    await this.notificationsService.markAsRead({
      notificationId: id,
      userId: session.user.id,
    });

    return { success: true, message: "Notification marked as read" };
  }
}

