"use client";

import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import type { Task, TaskStatus } from "@repo/types";
import { cn } from "@/lib/utils";

import { TaskKanbanColumn } from "./task-kanban-column";

export type TasksKanbanBoardProps = {
  tasksByStatus: Record<TaskStatus, Task[]>;
  statuses: readonly TaskStatus[];
  onDragEnd: (event: DragEndEvent) => void;
  canManage: (task: Task) => boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
};

export function TasksKanbanBoard({
  tasksByStatus,
  statuses,
  onDragEnd,
  canManage,
  onEdit,
  onDelete,
}: TasksKanbanBoardProps) {
  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <div
        className={cn(
          "flex gap-4 overflow-x-auto pb-3 pt-1 snap-x snap-mandatory scroll-px-4 -mx-1 px-1",
          "md:grid md:mx-0 md:grid-cols-2 md:overflow-visible md:px-0 md:pb-0 md:snap-none",
          "lg:grid-cols-3",
        )}
        role="region"
        aria-label="Task columns"
      >
        {statuses.map((status) => (
          <div
            key={status}
            className={cn(
              "w-[min(100%,20rem)] shrink-0 snap-center md:w-auto md:min-w-0 md:snap-none",
            )}
          >
            <TaskKanbanColumn
              status={status}
              tasks={tasksByStatus[status]}
              canManage={canManage}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        ))}
      </div>
    </DndContext>
  );
}
