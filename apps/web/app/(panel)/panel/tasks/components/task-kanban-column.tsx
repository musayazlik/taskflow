"use client";

import { useDroppable } from "@dnd-kit/core";
import { Badge } from "@repo/shadcn-ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/shadcn-ui/card";
import type { Task, TaskStatus } from "@repo/types";

import { TaskCardDraggable } from "./task-card-draggable";

export type TaskKanbanColumnProps = {
  status: TaskStatus;
  tasks: Task[];
  canManage: (task: Task) => boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
};

export function TaskKanbanColumn({
  status,
  tasks,
  canManage,
  onEdit,
  onDelete,
}: TaskKanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div ref={setNodeRef}>
      <Card
        className="bg-zinc-50/70 border border-zinc-200/70 rounded-lg shadow-none dark:bg-zinc-950/25 dark:border-zinc-800/70"
        style={{
          borderColor: isOver ? "rgb(82 82 238)" : undefined,
          boxShadow: isOver ? "0 0 0 1px rgba(99,102,241,0.55)" : undefined,
        }}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between gap-3 capitalize">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {status === "IN_PROGRESS"
                ? "In Progress"
                : status === "DONE"
                  ? "Done"
                  : "Backlog"}
            </span>
            <Badge
              variant="secondary"
              className="bg-white border-zinc-200 text-zinc-900 px-2 py-0.5 text-xs dark:bg-zinc-900/40 dark:border-zinc-800 dark:text-zinc-200"
            >
              {tasks.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 min-h-[120px] md:min-h-[160px]">
          {tasks.length === 0 ? (
            <div className="text-sm text-zinc-500/90 py-6 text-center dark:text-zinc-400/90">
              No task added here.
            </div>
          ) : null}
          {tasks.map((task) => (
            <TaskCardDraggable
              key={task.id}
              task={task}
              canManage={canManage(task)}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
