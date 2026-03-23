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
