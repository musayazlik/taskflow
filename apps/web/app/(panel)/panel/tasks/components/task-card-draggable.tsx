"use client";

import type { UniqueIdentifier } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { Button } from "@repo/shadcn-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/shadcn-ui/dropdown-menu";
import type { Task, TaskStatus } from "@repo/types";
import { cn } from "@/lib/utils";
import {
  CalendarClock,
  GripVertical,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";

export type TaskCardKanbanPreviewProps = {
  task: Task;
  status: TaskStatus;
  /** When true, used inside DragOverlay — stronger shadow / ring */
  isOverlay?: boolean;
};

export type TaskCardDraggableProps = {
  task: Task;
  status: TaskStatus;
  canManage: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
};

function formatShortDate(iso: string | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(d);
}

/** Card body for list + drag overlay (same visuals). */
export function TaskCardKanbanPreview({
  task,
  status,
  isOverlay = false,
}: TaskCardKanbanPreviewProps) {
  const updated = formatShortDate(task.updatedAt);

  return (
    <div
      className={cn(
        "relative rounded-xl border bg-white/95 p-3.5 shadow-sm dark:bg-zinc-950/60",
        "border-zinc-200/90 dark:border-zinc-800/90",
        isOverlay &&
          "shadow-2xl ring-2 ring-indigo-400/40 dark:ring-indigo-500/35 cursor-grabbing",
      )}
    >
      <div
        className={cn(
          "absolute left-0 top-3 bottom-3 w-[3px] rounded-full",
          status === "TODO" && "bg-violet-500/85",
          status === "IN_PROGRESS" && "bg-indigo-500/85",
          status === "DONE" && "bg-emerald-500/85",
        )}
        aria-hidden
      />

      <div className="flex items-start justify-between gap-2 pl-2.5">
        <div className="min-w-0 flex-1 pr-1">
          <p className="text-[15px] font-semibold leading-snug tracking-tight text-zinc-900 dark:text-zinc-50 break-words">
            {task.title}
          </p>
          {task.description ? (
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 line-clamp-3 dark:text-zinc-400">
              {task.description}
            </p>
          ) : null}

          {updated ? (
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-500">
              <CalendarClock className="h-3.5 w-3.5 shrink-0 opacity-80" />
              <span>Updated {updated}</span>
            </div>
          ) : null}
        </div>

        {isOverlay ? (
          <div
            className="flex shrink-0 items-center justify-center rounded-lg p-1.5 text-zinc-400 dark:text-zinc-500"
            aria-hidden
          >
            <GripVertical className="h-4 w-4" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function TaskCardDraggable({
  task,
  status,
  canManage,
  onEdit,
  onDelete,
}: TaskCardDraggableProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id as UniqueIdentifier,
  });
  const updatedLabel = formatShortDate(task.updatedAt);

  return (
    <div
      ref={setNodeRef}
      style={{
        opacity: isDragging ? 0 : 1,
      }}
      className={cn(
        "relative transition-opacity",
        isDragging && "pointer-events-none",
      )}
    >
      <div
        className={cn(
          "rounded-xl border bg-white/95 shadow-sm transition-[box-shadow,border-color] dark:bg-zinc-950/60",
          "border-zinc-200/90 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800/90 dark:hover:border-zinc-700",
        )}
      >
        <div className="relative p-3.5">
          <div
            className={cn(
              "absolute left-0 top-3 bottom-3 w-[3px] rounded-full",
              status === "TODO" && "bg-violet-500/85",
              status === "IN_PROGRESS" && "bg-indigo-500/85",
              status === "DONE" && "bg-emerald-500/85",
            )}
            aria-hidden
          />

          <div className="flex items-start justify-between gap-2 pl-2.5">
            <div className="min-w-0 flex-1 pr-1">
              <p className="text-[15px] font-semibold leading-snug tracking-tight text-zinc-900 dark:text-zinc-50 break-words">
                {task.title}
              </p>
              {task.description ? (
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 line-clamp-3 dark:text-zinc-400">
                  {task.description}
                </p>
              ) : null}

              {updatedLabel ? (
                <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-500">
                  <CalendarClock className="h-3.5 w-3.5 shrink-0 opacity-80" />
                  <span>Updated {updatedLabel}</span>
                </div>
              ) : null}
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1">
              {canManage ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-zinc-500 opacity-80 hover:opacity-100 dark:text-zinc-400"
                      aria-label="Task actions"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={() => onEdit(task)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600 dark:text-red-400"
                      onClick={() => onDelete(task)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <span className="h-8 w-8 shrink-0" aria-hidden />
              )}

              <button
                type="button"
                {...listeners}
                {...attributes}
                className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-800 cursor-grab active:cursor-grabbing dark:hover:bg-zinc-800/80 dark:hover:text-zinc-200"
                aria-label="Drag task"
              >
                <GripVertical className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
