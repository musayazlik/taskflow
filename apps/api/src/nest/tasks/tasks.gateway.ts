import { Logger } from "@nestjs/common";
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import type { Server, Socket } from "socket.io";

import { auth } from "@api/lib/auth";
import { env } from "@api/lib/env";
import type { TaskRealtimeMessage } from "@repo/types";

/**
 * Authenticated Socket.IO namespace for task list updates.
 * Clients join `user:{id}` and optionally `tasks:admins`.
 */
@WebSocketGateway({
  namespace: "/tasks",
  cors: {
    origin: env.FRONTEND_URL,
    credentials: true,
  },
})
export class TasksGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(TasksGateway.name);

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
      if (!session?.user?.id) {
        client.disconnect(true);
        return;
      }

      const userId = session.user.id;
      const role = String(session.user.role ?? "USER");
      client.data.userId = userId;
      client.data.role = role;

      await client.join(`user:${userId}`);
      if (role === "ADMIN" || role === "SUPER_ADMIN") {
        await client.join("tasks:admins");
      }
    } catch (err) {
      this.logger.warn({ err }, "Tasks WebSocket auth failed");
      client.disconnect(true);
    }
  }

  handleDisconnect(_client: Socket): void {
    // Rooms are dropped automatically.
  }

  emitToRooms(rooms: Iterable<string>, message: TaskRealtimeMessage): void {
    const uniq = new Set(rooms);
    for (const room of uniq) {
      this.server.to(room).emit("tasks:mutation", message);
    }
  }
}
