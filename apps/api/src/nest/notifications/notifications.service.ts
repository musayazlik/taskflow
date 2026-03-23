import { Injectable } from "@nestjs/common";

import { prisma, type Notification, NotificationType } from "@repo/database";

import { AppError } from "@api/lib/errors";

import { NotificationsRealtimeService } from "./notifications-realtime.service";

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRealtime: NotificationsRealtimeService,
  ) {}

  async listByUser(userId: string): Promise<Notification[]> {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  async markAsRead(input: { notificationId: string; userId: string }) {
    const existing = await prisma.notification.findFirst({
      where: { id: input.notificationId, userId: input.userId },
    });

    if (!existing) {
      throw new AppError(
        "NOTIFICATION_NOT_FOUND",
        "Notification not found",
        404,
      );
    }

    const updated = await prisma.notification.update({
      where: { id: input.notificationId },
      data: { read: true },
    });

    this.notificationsRealtime.emitNotificationUpdated(updated);

    return updated;
  }

  async createForTask(input: {
    type: NotificationType;
    userId: string;
    taskId?: string;
    message: string;
  }): Promise<Notification> {
    const created = await prisma.notification.create({
      data: {
        type: input.type,
        message: input.message,
        read: false,
        userId: input.userId,
        taskId: input.taskId ?? null,
      },
    });

    this.notificationsRealtime.emitNotificationCreated(created);

    return created;
  }
}
