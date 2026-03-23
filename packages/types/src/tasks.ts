/**
 * TaskFlow panel — Kanban tasks (aligned with Prisma Task / API payloads).
 */

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export const TASK_STATUSES: readonly TaskStatus[] = [
  "TODO",
  "IN_PROGRESS",
  "DONE",
] as const;

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  ownerId: string;
  assigneeId: string | null;
  /** ISO strings when returned from API / WebSocket (Prisma JSON). */
  createdAt?: string;
  updatedAt?: string;
};

/** Server → client payload on `tasks:mutation` (Socket.IO). */
export type TaskRealtimeMessage =
  | { type: "created"; task: Task }
  | { type: "updated"; task: Task }
  | {
      type: "deleted";
      taskId: string;
      ownerId: string;
      assigneeId: string | null;
    };

/** GET /api/tasks paginated list body */
export type TasksListResponse = {
  success: boolean;
  data?: Task[];
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

/** GET /api/tasks/assignable-users item */
export type AssignableUser = {
  id: string;
  name: string | null;
  email: string;
};

/** Human label for Kanban column / select options */
export function taskColumnLabel(status: TaskStatus): string {
  if (status === "IN_PROGRESS") return "In progress";
  if (status === "DONE") return "Done";
  return "Backlog";
}

/** Whether the current user may edit or delete a task (owner or elevated role). */
export function canUserManageTask(
  task: Task,
  userId: string | undefined,
  role: string | undefined,
): boolean {
  if (!userId) return false;
  if (role === "ADMIN" || role === "SUPER_ADMIN") return true;
  return task.ownerId === userId;
}

/** Whether this task should appear in the current user's board list. */
export function taskVisibleForUser(
  task: Task,
  userId: string | undefined,
  role: string | undefined,
): boolean {
  if (!userId) return false;
  if (role === "ADMIN" || role === "SUPER_ADMIN") return true;
  return task.ownerId === userId || task.assigneeId === userId;
}

/**
 * Merge a realtime mutation into the local task list (Kanban / list views).
 * Handles assignee changes: user who no longer sees the task drops it from the list.
 */
export function applyTasksRealtimeMessage(
  prev: Task[],
  message: TaskRealtimeMessage,
  viewerUserId: string | undefined,
  viewerRole: string | undefined,
): Task[] {
  if (message.type === "deleted") {
    return prev.filter((t) => t.id !== message.taskId);
  }

  const task = message.task;
  if (!taskVisibleForUser(task, viewerUserId, viewerRole)) {
    return prev.filter((t) => t.id !== task.id);
  }

  const without = prev.filter((t) => t.id !== task.id);
  const next = [task, ...without];
  next.sort((a, b) => {
    const at = a.updatedAt ? Date.parse(a.updatedAt) : 0;
    const bt = b.updatedAt ? Date.parse(b.updatedAt) : 0;
    return bt - at;
  });
  return next;
}
