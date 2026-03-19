import { Injectable } from "@nestjs/common";

import { prisma } from "@repo/database";

import { AppError } from "@api/lib/errors";

type NotificationType = "TASK_CREATED" | "TASK_UPDATED" | "TASK_ASSIGNED";

type NotificationRecord = {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: Date | string;
  userId: string;
  taskId: string | null;
};

type NotificationDelegate = {
  findMany: (args: unknown) => Promise<unknown[]>;
  findFirst: (args: unknown) => Promise<unknown | null>;
  update: (args: unknown) => Promise<unknown>;
  create: (args: unknown) => Promise<unknown>;
};

type PrismaWithNotification = typeof prisma extends infer T
  ? Omit<T, never> & { notification: NotificationDelegate }
  : never;

const prismaWithNotification = prisma as unknown as PrismaWithNotification;

@Injectable()
export class NotificationsService {
  private isMissingNotificationTableError(err: unknown): boolean {
    if (!(err instanceof Error)) return false;
    const msg = err.message.toLowerCase();
    return (
      msg.includes("public.notification") ||
      (msg.includes("table") &&
        msg.includes("notification") &&
        msg.includes("does not exist"))
    );
  }

  async listByUser(userId: string): Promise<NotificationRecord[]> {
    try {
      const notifications = await prismaWithNotification.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      return notifications as NotificationRecord[];
    } catch (err) {
      if (this.isMissingNotificationTableError(err)) {
        // TaskFlow migrations weren't applied yet.
        return [];
      }
      throw err;
    }
  }

  async markAsRead(input: { notificationId: string; userId: string }) {
    try {
      const existing = await prismaWithNotification.notification.findFirst({
        where: { id: input.notificationId, userId: input.userId },
      });

      if (!existing) {
        throw new AppError(
          "NOTIFICATION_NOT_FOUND",
          "Notification not found",
          404,
        );
      }

      const notification = await prismaWithNotification.notification.update({
        where: { id: input.notificationId },
        data: { read: true },
      });

      return notification as NotificationRecord;
    } catch (err) {
      if (this.isMissingNotificationTableError(err)) {
        throw new AppError(
          "NOTIFICATIONS_NOT_READY",
          "TaskFlow is not initialized yet. Run prisma migrations first.",
          503,
        );
      }
      throw err;
    }
  }

  async createForTask(input: {
    type: NotificationType;
    userId: string;
    taskId?: string;
    message: string;
  }): Promise<NotificationRecord> {
    const notification = await prismaWithNotification.notification.create({
      data: {
        type: input.type,
        message: input.message,
        read: false,
        userId: input.userId,
        taskId: input.taskId ?? null,
      },
    });

    return notification as NotificationRecord;
  }
}
