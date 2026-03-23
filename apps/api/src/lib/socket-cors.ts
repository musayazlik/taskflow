import { env } from "@api/lib/env";

/**
 * Socket.IO gateway CORS: allow the primary frontend URL and optional extra origins
 * (e.g. www vs apex, preview URLs). Comma-separated list in SOCKET_CORS_ORIGINS.
 */
export function getSocketCorsOptions(): {
  origin: string | string[];
  credentials: true;
} {
  const extra = process.env.SOCKET_CORS_ORIGINS;
  if (extra && extra.trim().length > 0) {
    const list = extra
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const merged = [env.FRONTEND_URL, ...list];
    const uniq = [...new Set(merged)];
    return { origin: uniq, credentials: true };
  }
  return { origin: env.FRONTEND_URL, credentials: true };
}
