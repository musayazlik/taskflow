"use client";

import {
  DndContext,
  DragOverlay,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import type { Task, TaskStatus } from "@repo/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";

import { Button } from "@repo/shadcn-ui/button";
import { cn } from "@/lib/utils";

import { TaskCardKanbanPreview } from "./task-card-draggable";
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
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeDrag = useMemo(() => {
    if (!activeId) return null;
    for (const s of statuses) {
      const t = tasksByStatus[s].find((x) => x.id === activeId);
      if (t) return { task: t, status: s };
    }
    return null;
  }, [activeId, tasksByStatus, statuses]);

  const scrollBy = useCallback((dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const delta = Math.min(360, el.clientWidth * 0.65) * dir;
    el.scrollBy({ left: delta, behavior: "smooth" });
  }, []);

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={({ active }) => setActiveId(String(active.id))}
      onDragCancel={() => setActiveId(null)}
      onDragEnd={(event) => {
        setActiveId(null);
        onDragEnd(event);
      }}
    >
      <div className="relative p-4 rounded-lg">
        <div className="flex items-center justify-end gap-2 pb-2 md:hidden">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0 rounded-full border-zinc-200 bg-white/80 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/60"
            onClick={() => scrollBy(-1)}
            aria-label="Scroll board left"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0 rounded-full border-zinc-200 bg-white/80 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/60"
            onClick={() => scrollBy(1)}
            aria-label="Scroll board right"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div
          ref={scrollerRef}
          className={cn(
            "flex flex-nowrap gap-5 overflow-x-auto overflow-y-hidden scroll-smooth pb-4 pt-1",
            "snap-x snap-mandatory scroll-px-4 -mx-1 px-1 md:scroll-px-6 md:-mx-2 md:px-2",
            "[scrollbar-width:thin]",
            "[&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300/80 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-600",
            "[&::-webkit-scrollbar-track]:bg-zinc-100/80 dark:[&::-webkit-scrollbar-track]:bg-zinc-900/50",
          )}
          role="region"
          aria-label="Task columns — scroll horizontally"
          tabIndex={0}
        >
          {statuses.map((status) => (
            <div
              key={status}
              className="w-[min(88vw,22rem)] shrink-0 snap-center sm:w-[23rem] md:w-[24rem]"
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

        <DragOverlay dropAnimation={{ duration: 200, easing: "ease-out" }}>
          {activeDrag ? (
            <div className="w-[min(88vw,22rem)] shrink-0 sm:w-[23rem] md:w-[24rem] pointer-events-none">
              <TaskCardKanbanPreview
                task={activeDrag.task}
                status={activeDrag.status}
                isOverlay
              />
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
