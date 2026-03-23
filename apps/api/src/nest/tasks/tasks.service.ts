import { Injectable } from "@nestjs/common";

import {
  prisma,
  Prisma,
  type Task,
  TaskStatus,
  NotificationType,
} from "@repo/database";

import { AppError } from "@api/lib/errors";

import { NotificationsService } from "../notifications/notifications.service";

import { TasksRealtimeService } from "./tasks-realtime.service";

const isTaskStatus = (status: string): status is TaskStatus =>
  status === "TODO" || status === "IN_PROGRESS" || status === "DONE";

@Injectable()
export class TasksService {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly tasksRealtime: TasksRealtimeService,
  ) {}

  async createTask(input: {
    ownerId: string;
    title: string;
    description?: string;
    status?: TaskStatus;
    assigneeId?: string | null;
  }): Promise<Task> {
    const rawStatus = input.status ?? "TODO";
    if (!isTaskStatus(rawStatus)) {
      throw new AppError("VALIDATION_ERROR", "Invalid task status", 400);
    }
    const status = rawStatus;

    const created = await prisma.task.create({
      data: {
        title: input.title,
        description: input.description ?? null,
        status,
        ownerId: input.ownerId,
        assigneeId: input.assigneeId ?? null,
      },
    });

    await Promise.all([
      this.notificationsService.createForTask({
        type: NotificationType.TASK_CREATED,
        userId: created.ownerId,
        taskId: created.id,
        message: `Task created: ${created.title} (${created.status})`,
      }),
      created.assigneeId
        ? this.notificationsService.createForTask({
            type: NotificationType.TASK_ASSIGNED,
            userId: created.assigneeId,
            taskId: created.id,
            message: `You were assigned a task: ${created.title} (${created.status})`,
          })
        : Promise.resolve(),
    ]);

    this.tasksRealtime.emitTaskCreated(created);

    return created;
  }

  async listTasks(input: {
    userId: string;
    role: string;
    page: number;
    limit: number;
    status?: string;
  }): Promise<{
    tasks: Task[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { userId, role, page, limit } = input;

    const statusFilter =
      input.status && isTaskStatus(input.status) ? input.status : undefined;

    const where: Prisma.TaskWhereInput = (() => {
      if (role === "ADMIN" || role === "SUPER_ADMIN") {
        return statusFilter ? { status: statusFilter } : {};
      }

      if (statusFilter) {
        return {
          OR: [{ ownerId: userId }, { assigneeId: userId }],
          status: statusFilter,
        };
      }

      return { OR: [{ ownerId: userId }, { assigneeId: userId }] };
    })();

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    return {
      tasks,
      total,
      page,
      limit,
    };
  }

  async getTaskById(input: {
    taskId: string;
    userId: string;
    role: string;
  }): Promise<Task> {
    const task = await prisma.task.findFirst({
      where:
        input.role === "ADMIN" || input.role === "SUPER_ADMIN"
          ? { id: input.taskId }
          : {
              id: input.taskId,
              OR: [{ ownerId: input.userId }, { assigneeId: input.userId }],
            },
    });

    if (!task) {
      throw new AppError("TASK_NOT_FOUND", "Task not found", 404);
    }

    return task;
  }

  async updateTask(input: {
    taskId: string;
    userId: string;
    role: string;
    title?: string;
    description?: string | null;
    status?: TaskStatus;
  }): Promise<Task> {
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

    const updated = await prisma.task.update({
      where: { id: input.taskId },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
      },
    });

    const changes: string[] = [];
    if (input.title !== undefined && input.title !== existing.title) {
      changes.push("title updated");
    }
    if (input.description !== undefined && input.description !== existing.description) {
      changes.push("description updated");
    }
    if (input.status !== undefined && input.status !== existing.status) {
      changes.push(`status changed to ${input.status}`);
    }
    const changesSummary = changes.length ? ` (${changes.join(", ")})` : "";

    await Promise.all([
      this.notificationsService.createForTask({
        type: NotificationType.TASK_UPDATED,
        userId: updated.ownerId,
        taskId: updated.id,
        message: `Task updated: ${updated.title} (${updated.status})${changesSummary}`,
      }),
      updated.assigneeId && updated.assigneeId !== updated.ownerId
        ? this.notificationsService.createForTask({
            type: NotificationType.TASK_UPDATED,
            userId: updated.assigneeId,
            taskId: updated.id,
            message: `Task updated: ${updated.title} (${updated.status})${changesSummary}`,
          })
        : Promise.resolve(),
    ]);

    this.tasksRealtime.emitTaskUpdated(updated);

    return updated;
  }

  async assignTask(input: {
    taskId: string;
    userId: string;
    role: string;
    assigneeId: string | null;
  }): Promise<Task> {
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

    const result = await prisma.task.update({
      where: { id: input.taskId },
      data: {
        assigneeId: input.assigneeId,
      },
    });

    const prevAssigneeId = existing.assigneeId;
    const nextAssigneeId = result.assigneeId;

    const [prevAssignee, nextAssignee] = await Promise.all([
      prevAssigneeId
        ? prisma.user.findUnique({
            where: { id: prevAssigneeId },
            select: { id: true, name: true, email: true },
          })
        : Promise.resolve(null),
      nextAssigneeId
        ? prisma.user.findUnique({
            where: { id: nextAssigneeId },
            select: { id: true, name: true, email: true },
          })
        : Promise.resolve(null),
    ]);

    const formatUser = (u: { id: string; name: string | null; email: string | null } | null) => {
      if (!u) return "Unassigned";
      return u.name ?? u.email ?? u.id;
    };

    const actionLabel = (() => {
      if (!prevAssigneeId && nextAssigneeId) {
        return `assigned to ${formatUser(nextAssignee)}`;
      }
      if (prevAssigneeId && !nextAssigneeId) {
        return `unassigned`;
      }
      if (prevAssigneeId && nextAssigneeId && prevAssigneeId !== nextAssigneeId) {
        return `reassigned to ${formatUser(nextAssignee)}`;
      }
      return `assignment updated`;
    })();

    const ownerMessage = `Task ${actionLabel}: ${result.title} (${result.status})`;

    await Promise.all([
      this.notificationsService.createForTask({
        type: NotificationType.TASK_ASSIGNED,
        userId: result.ownerId,
        taskId: result.id,
        message: ownerMessage,
      }),
      nextAssigneeId
        ? this.notificationsService.createForTask({
            type: NotificationType.TASK_ASSIGNED,
            userId: nextAssigneeId,
            taskId: result.id,
            message:
              prevAssigneeId && prevAssigneeId !== nextAssigneeId
                ? `You were assigned a task: ${result.title} (${result.status}) (previously assigned to ${formatUser(prevAssignee)})`
                : `You were assigned a task: ${result.title} (${result.status})`,
          })
        : prevAssigneeId
          ? this.notificationsService.createForTask({
              type: NotificationType.TASK_ASSIGNED,
              userId: prevAssigneeId,
              taskId: result.id,
              message: `You were unassigned a task: ${result.title} (${result.status})`,
            })
          : Promise.resolve(),
    ]);

    this.tasksRealtime.emitTaskUpdated(result, {
      previousAssigneeId: existing.assigneeId,
    });

    return result;
  }

  async deleteTask(input: {
    taskId: string;
    userId: string;
    role: string;
  }): Promise<void> {
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
        "Only the task owner can delete the task",
        403,
      );
    }

    // IMPORTANT: Notification.task has `onDelete: Cascade`.
    // For delete notifications we set `taskId` to null, so the notification
    // remains even after the task row is removed.
    const deletedMessage = `Task deleted: ${existing.title} (${existing.status})`;

    await Promise.all([
      this.notificationsService.createForTask({
        type: NotificationType.TASK_UPDATED,
        userId: existing.ownerId,
        message: deletedMessage,
      }),
      existing.assigneeId
        ? this.notificationsService.createForTask({
            type: NotificationType.TASK_UPDATED,
            userId: existing.assigneeId,
            message: deletedMessage,
          })
        : Promise.resolve(),
    ]);

    await prisma.task.delete({
      where: { id: input.taskId },
    });

    this.tasksRealtime.emitTaskDeleted(existing.id, {
      ownerId: existing.ownerId,
      assigneeId: existing.assigneeId,
    });
  }

  /** Minimal user list for assignee pickers (authenticated users only). */
  async listAssignableUsers(): Promise<
    { id: string; name: string | null; email: string }[]
  > {
    return prisma.user.findMany({
      select: { id: true, name: true, email: true },
      orderBy: [{ name: "asc" }, { email: "asc" }],
      take: 200,
    });
  }
}
