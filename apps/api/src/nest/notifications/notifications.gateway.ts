import { Logger } from "@nestjs/common";
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import type { Server, Socket } from "socket.io";

import { auth } from "@api/lib/auth";
import { getSocketCorsOptions } from "@api/lib/socket-cors";
import type { NotificationRealtimeMessage } from "@repo/types";

/**
 * Authenticated Socket.IO namespace for user notifications.
 *
 * Clients join room `user:{id}` after cookie-based session validation.
 */
@WebSocketGateway({
  namespace: "/notifications",
  cors: getSocketCorsOptions(),
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  async handleConnection(client: Socket): Promise<void> {
    const rawCookie = client.handshake.headers.cookie;
    if (!rawCookie || typeof rawCookie !== "string") {
      client.disconnect(true);
      return;
    }

    try {
      const session = await auth.api.getSession({
        headers: { cookie: rawCookie },
      });

      const userId = session?.user?.id;
      if (!userId) {
        client.disconnect(true);
        return;
      }

      client.data.userId = userId;
      await client.join(`user:${userId}`);
    } catch (err) {
      this.logger.warn({ err }, "Notifications WebSocket auth failed");
      client.disconnect(true);
    }
  }

  handleDisconnect(_client: Socket): void {
    // Rooms are dropped automatically.
  }

  emitToRooms(rooms: Iterable<string>, message: NotificationRealtimeMessage) {
    const uniq = new Set(rooms);
    for (const room of uniq) {
      this.server.to(room).emit("notifications:mutation", message);
    }
  }
}

