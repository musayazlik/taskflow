"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { UniqueIdentifier } from "@dnd-kit/core";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/shadcn-ui/card";
import { Badge } from "@repo/shadcn-ui/badge";
import { Button } from "@repo/shadcn-ui/button";
import { Input } from "@repo/shadcn-ui/input";

import { toast } from "sonner";
import { GripVertical, Plus, Search, RefreshCw, SlidersHorizontal } from "lucide-react";

import { apiClient } from "@/lib/api";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  ownerId: string;
  assigneeId: string | null;
};

type TasksListResponse = {
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

function TaskCardDraggable({
  task,
}: {
  task: Task;
}) {
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

        <div
          {...listeners}
          {...attributes}
          className="shrink-0 mt-1 p-1 rounded-md text-zinc-500 hover:text-zinc-800 cursor-grab active:cursor-grabbing dark:text-zinc-400 dark:hover:text-zinc-200"
          aria-label="Drag task"
          role="button"
          tabIndex={0}
        >
          <GripVertical className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({
  status,
  tasks,
}: {
  status: TaskStatus;
  tasks: Task[];
}) {
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
        <CardContent className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-sm text-zinc-500/90 py-6 text-center dark:text-zinc-400/90">
              No task added here.
            </div>
          ) : null}
          {tasks.map((task) => (
            <TaskCardDraggable
              key={task.id}
              task={task}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function TasksPageClient() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingTitle, setCreatingTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const statuses: TaskStatus[] = useMemo(() => ["TODO", "IN_PROGRESS", "DONE"], []);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = (await apiClient.get<TasksListResponse>(
        "/api/tasks?page=1&limit=50",
      )) as unknown;

      const response = res as TasksListResponse;
      if (!response?.success || !Array.isArray(response.data)) {
        toast.error(response?.message || "Failed to load tasks");
        setTasks([]);
        return;
      }

      setTasks(response.data);
    } catch {
      toast.error("Failed to connect to server");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const createTask = useCallback(async () => {
    const title = creatingTitle.trim();
    if (!title) {
      toast.error("Title is required");
      return;
    }

    try {
      const res = await apiClient.post<{ success: boolean; data?: Task; message?: string }>(
        "/api/tasks",
        { title },
      );

      if (!res?.success || !res.data) {
        toast.error(res?.message || "Failed to create task");
        return;
      }

      setCreatingTitle("");
      setTasks((prev) => [res.data as Task, ...prev]);
      toast.success("Task created");
    } catch {
      toast.error("Failed to create task");
    }
  }, [creatingTitle]);

  const updateStatus = useCallback(async (taskId: string, status: TaskStatus) => {
    try {
      const res = await apiClient.patch<{ success: boolean; data?: Task; message?: string }>(
        `/api/tasks/${taskId}`,
        { status },
      );

      if (!res?.success || !res.data) {
        toast.error(res?.message || "Failed to update task");
        return;
      }

      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? (res.data as Task) : t)),
      );
    } catch {
      toast.error("Failed to update task");
    }
  }, []);

  const filteredTasks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter((t) => {
      const titleMatch = t.title.toLowerCase().includes(q);
      const descMatch = (t.description ?? "").toLowerCase().includes(q);
      return titleMatch || descMatch;
    });
  }, [tasks, searchQuery]);

  const tasksByStatus = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      TODO: [],
      IN_PROGRESS: [],
      DONE: [],
    };
    for (const t of filteredTasks) map[t.status].push(t);
    return map;
  }, [filteredTasks]);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeTaskId = String(active.id);
      const candidate = String(over.id);
      if (!statuses.includes(candidate as TaskStatus)) return;
      const nextStatus = candidate as TaskStatus;

      const currentTask = tasks.find((t) => t.id === activeTaskId);
      if (!currentTask) return;
      if (currentTask.status === nextStatus) return;

      // Drop hedefi kolon ise status update et.
      await updateStatus(activeTaskId, nextStatus);
    },
    [tasks, updateStatus, statuses],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Tasks</div>
          <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Kanban Board
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-[260px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="pl-9 bg-white border-zinc-200 text-zinc-900 dark:bg-zinc-950/30 dark:border-zinc-800 dark:text-zinc-200"
            />
          </div>

          <Input
            value={creatingTitle}
            onChange={(e) => setCreatingTitle(e.target.value)}
            placeholder="Task title"
            className="w-[190px] bg-white border-zinc-200 text-zinc-900 dark:bg-zinc-950/30 dark:border-zinc-800 dark:text-zinc-200"
          />

          <Button
            type="button"
            variant="outline"
            className="bg-white border-zinc-200 text-zinc-900 dark:bg-zinc-950/30 dark:border-zinc-800 dark:text-zinc-200"
            onClick={() => toast.message("Filters coming soon")}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>

          <Button
            type="button"
            variant="outline"
            className="bg-white border-zinc-200 text-zinc-900 p-2 dark:bg-zinc-950/30 dark:border-zinc-800 dark:text-zinc-200"
            onClick={() => void loadTasks()}
            aria-label="Refresh"
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            disabled={loading}
            onClick={() => void createTask()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {statuses.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={tasksByStatus[status]}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}

