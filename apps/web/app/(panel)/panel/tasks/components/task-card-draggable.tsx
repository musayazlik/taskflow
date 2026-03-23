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
import type { Task } from "@repo/types";
import { GripVertical, MoreVertical, Pencil, Trash2 } from "lucide-react";

export type TaskCardDraggableProps = {
  task: Task;
  canManage: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
};

export function TaskCardDraggable({
  task,
  canManage,
  onEdit,
  onDelete,
}: TaskCardDraggableProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id as UniqueIdentifier,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        opacity: isDragging ? 0.5 : 1,
      }}
      className="rounded-lg border border-zinc-200/80 bg-white/95 p-3 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/25 dark:shadow-none"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 pr-2">
          <div className="font-semibold text-zinc-900 dark:text-zinc-100 break-words">
            {task.title}
          </div>
          {task.description ? (
            <div className="text-sm text-zinc-600 mt-1 line-clamp-2 dark:text-zinc-300/80">
              {task.description}
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 items-start gap-0.5">
          {canManage ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
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
          ) : null}

          <div
            {...listeners}
            {...attributes}
            className="mt-1 p-1 rounded-md text-zinc-500 hover:text-zinc-800 cursor-grab active:cursor-grabbing dark:text-zinc-400 dark:hover:text-zinc-200"
            aria-label="Drag task"
            role="button"
            tabIndex={0}
          >
            <GripVertical className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
