/**
 * TaskFlow panel notifications (shared Socket.IO wire types).
 *
 * These types are frontend-compatible and intentionally minimal.
 */

export type NotificationType = "TASK_CREATED" | "TASK_UPDATED" | "TASK_ASSIGNED";

export type Notification = {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  /**
   * ISO string (Prisma Date -> JSON string).
   * Present in realtime messages and API responses (depending on serialization).
   */
  createdAt?: string;
  taskId?: string | null;
};

/** Server → client payload on `notifications:mutation` (Socket.IO). */
export type NotificationRealtimeMessage =
  | { type: "created"; notification: Notification }
  | { type: "updated"; notification: Notification };

/**
 * Panel notifications UI (client-side view models).
 *
 * Note: This is intentionally separated from the wire `Notification` type above.
 * The UI uses human-readable categories and simplified "severity" types.
 */
export type NotificationsFilter =
  | "all"
  | "unread"
  | "success"
  | "warning"
  | "error"
  | "info";

export type UiNotification = {
  id: string;
  title: string;
  message: string;
  type: "success" | "warning" | "error" | "info";
  category: string;
  time: string;
  read?: boolean;
};

/**
 * Merge a realtime mutation into the local notification list.
 * - `created` inserts (or replaces) by `id`.
 * - `updated` replaces by `id`.
 */
export function applyNotificationsRealtimeMessage(
  prev: Notification[],
  message: NotificationRealtimeMessage,
): Notification[] {
  const incoming = message.notification;
  const id = incoming.id;

  const without = prev.filter((n) => n.id !== id);

  // For new items, place newest first when we have timestamps.
  const next = message.type === "created" ? [incoming, ...without] : [incoming, ...without];

  const getTs = (n: Notification): number => {
    const ts = n.createdAt ? Date.parse(n.createdAt) : 0;
    return Number.isNaN(ts) ? 0 : ts;
  };

  next.sort((a, b) => getTs(b) - getTs(a));
  return next;
}

