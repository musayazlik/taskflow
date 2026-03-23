import { Injectable } from "@nestjs/common";

import type { Task as PrismaTask } from "@repo/database";
import type { Task as TaskWire } from "@repo/types";

import { TasksGateway } from "./tasks.gateway";

/**
 * Broadcasts task mutations to Socket.IO rooms (owner, assignees, admins).
 */
@Injectable()
export class TasksRealtimeService {
  constructor(private readonly gateway: TasksGateway) {}

  private roomsForTaskSnapshot(
    ownerId: string,
    assigneeId: string | null,
    previousAssigneeId?: string | null,
  ): string[] {
    const rooms = new Set<string>([`user:${ownerId}`, "tasks:admins"]);
    if (assigneeId) {
      rooms.add(`user:${assigneeId}`);
    }
    if (
      previousAssigneeId !== undefined &&
      previousAssigneeId !== null &&
      previousAssigneeId !== assigneeId
    ) {
      rooms.add(`user:${previousAssigneeId}`);
    }
    return [...rooms];
  }

  /** Serialize Prisma models (Date → ISO string) for JSON clients. */
  private toWireTask(task: PrismaTask): TaskWire {
    return JSON.parse(JSON.stringify(task)) as TaskWire;
  }

  emitTaskCreated(task: PrismaTask): void {
    const wire = this.toWireTask(task);
    const rooms = this.roomsForTaskSnapshot(task.ownerId, task.assigneeId);
    this.gateway.emitToRooms(rooms, { type: "created", task: wire });
  }

  emitTaskUpdated(
    task: PrismaTask,
    options?: { previousAssigneeId?: string | null },
  ): void {
    const wire = this.toWireTask(task);
    const rooms = this.roomsForTaskSnapshot(
      task.ownerId,
      task.assigneeId,
      options?.previousAssigneeId,
    );
    this.gateway.emitToRooms(rooms, { type: "updated", task: wire });
  }

  emitTaskDeleted(
    taskId: string,
    snapshot: { ownerId: string; assigneeId: string | null },
  ): void {
    const rooms = this.roomsForTaskSnapshot(
      snapshot.ownerId,
      snapshot.assigneeId,
    );
    this.gateway.emitToRooms(rooms, {
      type: "deleted",
      taskId,
      ownerId: snapshot.ownerId,
      assigneeId: snapshot.assigneeId,
    });
  }
}
