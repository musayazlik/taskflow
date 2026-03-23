"use client";

import { useDroppable } from "@dnd-kit/core";
import { Badge } from "@repo/shadcn-ui/badge";
import { Card, CardContent, CardHeader } from "@repo/shadcn-ui/card";
import type { Task, TaskStatus } from "@repo/types";
import { cn } from "@/lib/utils";

import { TaskCardDraggable } from "./task-card-draggable";

export type TaskKanbanColumnProps = {
  status: TaskStatus;
  tasks: Task[];
  canManage: (task: Task) => boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
};

const columnMeta: Record<
  TaskStatus,
  { label: string; hint: string; accent: string; badge: string }
> = {
  TODO: {
    label: "Backlog",
    hint: "Ideas & triage",
    accent:
      "border-t-violet-500/90 bg-gradient-to-b from-violet-500/[0.07] to-transparent dark:from-violet-500/10",
    badge:
      "border-violet-200/80 bg-violet-50 text-violet-900 dark:border-violet-800/60 dark:bg-violet-950/50 dark:text-violet-100",
  },
  IN_PROGRESS: {
    label: "In progress",
    hint: "Active work",
    accent:
      "border-t-indigo-500/90 bg-gradient-to-b from-indigo-500/[0.08] to-transparent dark:from-indigo-500/12",
    badge:
      "border-indigo-200/80 bg-indigo-50 text-indigo-900 dark:border-indigo-800/60 dark:bg-indigo-950/50 dark:text-indigo-100",
  },
  DONE: {
    label: "Done",
    hint: "Shipped",
    accent:
      "border-t-emerald-500/90 bg-gradient-to-b from-emerald-500/[0.07] to-transparent dark:from-emerald-500/10",
    badge:
      "border-emerald-200/80 bg-emerald-50 text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-100",
  },
};

export function TaskKanbanColumn({
  status,
  tasks,
  canManage,
  onEdit,
  onDelete,
}: TaskKanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const meta = columnMeta[status];

  return (
    <div ref={setNodeRef} className="flex h-full min-h-0 flex-col">
      <Card
        className={cn(
          "flex max-h-[min(72vh,640px)] min-h-[min(72vh,640px)] flex-col overflow-hidden border border-zinc-200/90 shadow-sm ring-1 ring-black/[0.03] dark:border-zinc-800/90 dark:ring-white/[0.04]",
          "rounded-2xl border-t-[3px] bg-zinc-50/80 backdrop-blur-sm dark:bg-zinc-950/40",
          meta.accent,
          isOver &&
            "ring-2 ring-indigo-400/50 ring-offset-2 ring-offset-background dark:ring-indigo-500/40",
        )}
      >
        <CardHeader className="shrink-0 space-y-0 border-b border-zinc-200/60 px-4 pb-3 pt-4 dark:border-zinc-800/60">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {meta.hint}
              </p>
              <p className="truncate text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                {meta.label}
              </p>
            </div>
            <Badge
              variant="secondary"
              className={cn(
                "shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold tabular-nums",
                meta.badge,
              )}
            >
              {tasks.length}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col gap-0 px-3 pb-3 pt-2">
          <div
            className={cn(
              "min-h-0 flex-1 space-y-3 overflow-y-auto overflow-x-hidden px-1 py-1",
              "[scrollbar-width:thin]",
              "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300/70 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-600",
            )}
          >
            {tasks.length === 0 ? (
              <div className="flex min-h-[8rem] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200/90 bg-white/40 px-3 py-8 text-center dark:border-zinc-800/80 dark:bg-zinc-950/20">
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                  No tasks yet
                </p>
                <p className="mt-1 max-w-[12rem] text-xs leading-relaxed text-zinc-500 dark:text-zinc-500">
                  Drop a card here or create a task for this stage.
                </p>
              </div>
            ) : null}
            {tasks.map((task) => (
              <TaskCardDraggable
                key={task.id}
                task={task}
                status={status}
                canManage={canManage(task)}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
