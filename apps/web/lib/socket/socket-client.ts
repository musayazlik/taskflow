"use client";

import { io, type Socket } from "socket.io-client";

import { resolveApiBaseUrl } from "@repo/types";

type AppSocket = Socket;

let socketsByKey: Map<string, AppSocket> = new Map();
let socketsBase: string | null = null;

function createNamespaceSocket(base: string, namespace: string): AppSocket {
  return io(`${base}/${namespace}`, {
    path: "/socket.io/",
    withCredentials: true,
    // Keep long-polling fallback first for environments where WS upgrade is blocked.
    transports: ["polling", "websocket"],
    reconnection: true,
    reconnectionAttempts: 12,
    reconnectionDelay: 1000,
  });
}

/**
 * Global (per-tab) Socket.IO client instances keyed by API base + namespace.
 * The hook/component subscribes/unsubscribes events, but this module keeps the connection alive.
 */
export function getNamespaceSocket(namespace: string): AppSocket {
  // Always use the public API base URL (NEXT_PUBLIC_API_URL). Same-origin rewrites
  // (/socket.io → backend) often return 404 in standalone / edge deployments because
  // long-polling and upgrade paths do not proxy reliably. Session cookies scoped to the
  // parent domain (.example.com) are sent to the API origin when withCredentials is true.
  const base = resolveApiBaseUrl();
  const key = `${base}::${namespace}`;

  if (socketsBase !== base) {
    // Recreate when API base changes (rare), to avoid cross-environment pollution.
    for (const s of socketsByKey.values()) s.disconnect();
    socketsByKey = new Map();
    socketsBase = base;
  }

  const existing = socketsByKey.get(key);
  if (existing) return existing;

  const created = createNamespaceSocket(base, namespace);
  socketsByKey.set(key, created);
  return created;
}

/** Backward-compatible wrapper for the common `/tasks` namespace. */
export function getTasksSocket(): AppSocket {
  return getNamespaceSocket("tasks");
}

/** Wrapper for the common `/notifications` namespace. */
export function getNotificationsSocket(): AppSocket {
  return getNamespaceSocket("notifications");
}

