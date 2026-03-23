import { Injectable } from "@nestjs/common";

import type { Notification as PrismaNotification } from "@repo/database";
import type {
  Notification as NotificationWire,
  NotificationRealtimeMessage,
} from "@repo/types";

import { NotificationsGateway } from "./notifications.gateway";

/**
 * Broadcasts notification mutations to Socket.IO rooms.
 */
@Injectable()
export class NotificationsRealtimeService {
  constructor(private readonly gateway: NotificationsGateway) {}

  private toWireNotification(notification: PrismaNotification): NotificationWire {
    // Minimal mapping (avoid sending userId in the wire payload).
    return {
      id: notification.id,
      type: notification.type,
      message: notification.message,
      read: notification.read,
      createdAt: notification.createdAt?.toISOString(),
      taskId: notification.taskId,
    };
  }

  emitNotificationCreated(notification: PrismaNotification): void {
    const wire = this.toWireNotification(notification);
    const rooms = [`user:${notification.userId}`];
    const msg: NotificationRealtimeMessage = { type: "created", notification: wire };
    this.gateway.emitToRooms(rooms, msg);
  }

  emitNotificationUpdated(notification: PrismaNotification): void {
    const wire = this.toWireNotification(notification);
    const rooms = [`user:${notification.userId}`];
    const msg: NotificationRealtimeMessage = { type: "updated", notification: wire };
    this.gateway.emitToRooms(rooms, msg);
  }
}

