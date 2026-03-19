import { Injectable } from "@nestjs/common";

import { prisma } from "@repo/database";

import { AppError } from "@api/lib/errors";

import { NotificationsService } from "../notifications/notifications.service";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

type TaskRecord = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  ownerId: string;
  assigneeId: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

type PrismaDynamic = typeof prisma extends infer T ? T : never;

// The current Prisma schema does not yet contain TaskFlow models in this branch.
// We use a narrow, unknown-based adapter to keep compilation unblocked.
// After `prisma-replace-TaskFlow`, this can be replaced with real typed delegates.
type TaskDelegate = {
  create: (args: unknown) => Promise<unknown>;
  findMany: (args: unknown) => Promise<unknown[]>;
  count: (args: unknown) => Promise<number>;
  findFirst: (args: unknown) => Promise<unknown | null>;
  update: (args: unknown) => Promise<unknown>;
};

type PrismaWithTask = PrismaDynamic extends never
  ? never
  : Omit<PrismaDynamic, never> & {
      task: TaskDelegate;
    };

const prismaWithTask = prisma as unknown as PrismaWithTask;

const isValidTaskStatus = (status: string): status is TaskStatus => {
  return status === "TODO" || status === "IN_PROGRESS" || status === "DONE";
};

const isMissingTaskTableError = (err: unknown): boolean => {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return (
    msg.includes("public.task") ||
    (msg.includes("task") && msg.includes("does not exist"))
  );
};

@Injectable()
export class TasksService {
  constructor(private readonly notificationsService: NotificationsService) {}

  async createTask(input: {
    ownerId: string;
    title: string;
    description?: string;
    status?: TaskStatus;
    assigneeId?: string | null;
  }): Promise<TaskRecord> {
    const status: TaskStatus = input.status ?? "TODO";

    if (!isValidTaskStatus(status)) {
      throw new AppError("VALIDATION_ERROR", "Invalid task status", 400);
    }

    let task: unknown;
    try {
      task = await prismaWithTask.task.create({
        data: {
          title: input.title,
          description: input.description ?? null,
          status,
          ownerId: input.ownerId,
          assigneeId: input.assigneeId ?? null,
        },
      });
    } catch (err) {
      if (isMissingTaskTableError(err)) {
        throw new AppError(
          "TASKS_NOT_READY",
          "TaskFlow is not initialized. Run prisma migrations first.",
          503,
        );
      }
      throw err;
    }

    const created = task as TaskRecord;

    // Create notifications for owner and assignee (if any).
    await Promise.all([
      this.notificationsService.createForTask({
        type: "TASK_CREATED",
        userId: created.ownerId,
        taskId: created.id,
        message: `Task created: ${created.title}`,
      }),
      created.assigneeId
        ? this.notificationsService.createForTask({
            type: "TASK_ASSIGNED",
            userId: created.assigneeId,
            taskId: created.id,
            message: `You were assigned a task: ${created.title}`,
          })
        : Promise.resolve(),
    ]);

    return created;
  }

  async listTasks(input: {
    userId: string;
    role: string;
    page: number;
    limit: number;
    status?: string;
  }): Promise<{
    tasks: TaskRecord[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { userId, role, page, limit } = input;

    const statusFilter =
      input.status && isValidTaskStatus(input.status)
        ? input.status
        : undefined;

    const where = (() => {
      if (role === "ADMIN" || role === "SUPER_ADMIN") {
        return statusFilter ? { status: statusFilter } : {};
      }

      // Own tasks only (owner OR assignee)
      if (statusFilter) {
        return {
          OR: [{ ownerId: userId }, { assigneeId: userId }],
          status: statusFilter,
        };
      }

      return { OR: [{ ownerId: userId }, { assigneeId: userId }] };
    })();

    let tasks: unknown[] = [];
    let total = 0;
    try {
      const result = await Promise.all([
        prismaWithTask.task.findMany({
          where,
          orderBy: { updatedAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prismaWithTask.task.count({ where }),
      ]);

      tasks = result[0] as unknown[];
      total = result[1] as number;
    } catch (err) {
      if (isMissingTaskTableError(err)) {
        // TaskFlow migrations weren't applied yet.
        return { tasks: [], total: 0, page, limit };
      }
      throw err;
    }

    return {
      tasks: tasks as TaskRecord[],
      total,
      page,
      limit,
    };
  }

  async getTaskById(input: {
    taskId: string;
    userId: string;
    role: string;
  }): Promise<TaskRecord> {
    let task: unknown | null = null;
    try {
      task = await prismaWithTask.task.findFirst({
        where:
          input.role === "ADMIN" || input.role === "SUPER_ADMIN"
            ? { id: input.taskId }
            : {
                id: input.taskId,
                OR: [{ ownerId: input.userId }, { assigneeId: input.userId }],
              },
      });
    } catch (err) {
      if (isMissingTaskTableError(err)) {
        throw new AppError(
          "TASKS_NOT_READY",
          "TaskFlow is not initialized. Run prisma migrations first.",
          503,
        );
      }
      throw err;
    }

    if (!task) {
      throw new AppError("TASK_NOT_FOUND", "Task not found", 404);
    }

    return task as TaskRecord;
  }

  async updateTask(input: {
    taskId: string;
    userId: string;
    role: string;
    title?: string;
    description?: string | null;
    status?: TaskStatus;
  }): Promise<TaskRecord> {
    const existing = await this.getTaskById({
      taskId: input.taskId,
      userId: input.userId,
      role: input.role,
    });

    if (
      input.role !== "ADMIN" &&
      input.role !== "SUPER_ADMIN" &&
      existing.ownerId !== input.userId
    ) {
      throw new AppError(
        "FORBIDDEN",
        "Only the task owner can update the task",
        403,
      );
    }

    let updated: unknown;
    try {
      updated = await prismaWithTask.task.update({
        where: { id: input.taskId },
        data: {
          ...(input.title !== undefined ? { title: input.title } : {}),
          ...(input.description !== undefined
            ? { description: input.description }
            : {}),
          ...(input.status !== undefined ? { status: input.status } : {}),
        },
      });
    } catch (err) {
      if (isMissingTaskTableError(err)) {
        throw new AppError(
          "TASKS_NOT_READY",
          "TaskFlow is not initialized. Run prisma migrations first.",
          503,
        );
      }
      throw err;
    }

    const result = updated as TaskRecord;

    await Promise.all([
      this.notificationsService.createForTask({
        type: "TASK_UPDATED",
        userId: result.ownerId,
        taskId: result.id,
        message: `Task updated: ${result.title}`,
      }),
      result.assigneeId && result.assigneeId !== result.ownerId
        ? this.notificationsService.createForTask({
            type: "TASK_UPDATED",
            userId: result.assigneeId,
            taskId: result.id,
            message: `Task updated: ${result.title}`,
          })
        : Promise.resolve(),
    ]);

    return result;
  }

  async assignTask(input: {
    taskId: string;
    userId: string;
    role: string;
    assigneeId: string | null;
  }): Promise<TaskRecord> {
    const existing = await this.getTaskById({
      taskId: input.taskId,
      userId: input.userId,
      role: input.role,
    });

    if (
      input.role !== "ADMIN" &&
      input.role !== "SUPER_ADMIN" &&
      existing.ownerId !== input.userId
    ) {
      throw new AppError(
        "FORBIDDEN",
        "Only the task owner can assign the task",
        403,
      );
    }

    let updated: unknown;
    try {
      updated = await prismaWithTask.task.update({
        where: { id: input.taskId },
        data: {
          assigneeId: input.assigneeId,
        },
      });
    } catch (err) {
      if (isMissingTaskTableError(err)) {
        throw new AppError(
          "TASKS_NOT_READY",
          "TaskFlow is not initialized. Run prisma migrations first.",
          503,
        );
      }
      throw err;
    }

    const result = updated as TaskRecord;

    await Promise.all([
      this.notificationsService.createForTask({
        type: "TASK_ASSIGNED",
        userId: result.ownerId,
        taskId: result.id,
        message: `Task assignment updated: ${result.title}`,
      }),
      result.assigneeId
        ? this.notificationsService.createForTask({
            type: "TASK_ASSIGNED",
            userId: result.assigneeId,
            taskId: result.id,
            message: `You were assigned a task: ${result.title}`,
          })
        : Promise.resolve(),
    ]);

    return result;
  }
}
