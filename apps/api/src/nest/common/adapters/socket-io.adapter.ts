import { IoAdapter } from "@nestjs/platform-socket.io";
import type { ServerOptions } from "socket.io";

import { getSocketCorsOptions } from "@api/lib/socket-cors";

/**
 * Custom Socket.IO adapter that injects CORS options into the underlying
 * Socket.IO server. The default NestJS `IoAdapter` creates the server
 * without CORS, which causes cross-origin handshake failures in production.
 */
export class SocketIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: Partial<ServerOptions>): unknown {
    const cors = getSocketCorsOptions();

    return super.createIOServer(port, {
      ...options,
      cors,
      // Allow both transports so clients can start with long-polling
      // and upgrade to WebSocket (or fall back if upgrade is blocked).
      transports: ["polling", "websocket"],
    });
  }
}
