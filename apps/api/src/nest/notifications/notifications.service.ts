import { Injectable } from "@nestjs/common";

import { prisma, type Notification, NotificationType } from "@repo/database";

import { AppError } from "@api/lib/errors";

@Injectable()
export class NotificationsService {
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

    return prisma.notification.update({
      where: { id: input.notificationId },
      data: { read: true },
    });
  }

  async createForTask(input: {
    type: NotificationType;
    userId: string;
    taskId?: string;
    message: string;
  }): Promise<Notification> {
    return prisma.notification.create({
      data: {
        type: input.type,
        message: input.message,
        read: false,
        userId: input.userId,
        taskId: input.taskId ?? null,
      },
    });
  }
}
