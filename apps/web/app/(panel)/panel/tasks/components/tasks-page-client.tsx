"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { DragEndEvent } from "@dnd-kit/core";
import { toast } from "sonner";

import { useSession } from "@/lib/auth-client";
import {
  type AssignableUser,
  type Task,
  type TaskStatus,
  applyTasksRealtimeMessage,
  TASK_STATUSES,
  type TaskRealtimeMessage,
  canUserManageTask,
} from "@repo/types";

import { useSocketRealtime } from "@/lib/socket/use-socket-realtime";
import { taskService } from "@/services";
import { TaskBoardHeader } from "./task-board-header";
import { TaskCreateDialog, TaskDeleteDialog, TaskEditDialog } from "./dialogs";
import { TasksKanbanBoard } from "./tasks-kanban-board";
import type { TaskCreateInput, TaskEditInput } from "@repo/validations/task";

export function TasksPageClient() {
  const { data: session } = useSession();
  const sessionUser = session?.user as
    | { id?: string; role?: string }
    | undefined;
  const currentUserId = sessionUser?.id;
  const currentRole = sessionUser?.role;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [assignableUsers, setAssignableUsers] = useState<AssignableUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const [pendingDelete, setPendingDelete] = useState<Task | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const statuses = useMemo(() => TASK_STATUSES, []);

  const loadAssignableUsers = useCallback(async () => {
    const res = await taskService.getAssignableUsers();
    if (res.success && Array.isArray(res.data)) {
      setAssignableUsers(res.data);
    }
  }, []);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await taskService.getTasks({ page: 1, limit: 50 });
      if (!res.success || !res.data?.success || !Array.isArray(res.data.data)) {
        toast.error(res.message || res.data?.message || "Failed to load tasks");
        setTasks([]);
        return;
      }
      setTasks(res.data.data);
    } catch {
      toast.error("Failed to connect to server");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTasks();
    void loadAssignableUsers();
  }, [loadTasks, loadAssignableUsers]);

  useSocketRealtime<TaskRealtimeMessage, Task[]>({
    enabled: !!currentUserId,
    userId: currentUserId,
    role: currentRole,
    event: "tasks:mutation",
    setStateAction: setTasks,
    applyMessageAction: applyTasksRealtimeMessage,
  });

  const openEdit = useCallback((task: Task) => {
    setEditTask(task);
    setEditOpen(true);
  }, []);

  const createTask = useCallback(async (values: TaskCreateInput) => {
    try {
      const res = await taskService.createTask({
        title: values.title.trim(),
        description: values.description?.trim()
          ? values.description.trim()
          : undefined,
        status: values.status,
        assigneeId: values.assigneeId ?? undefined,
      });

      if (!res.success || !res.data) {
        return {
          success: false as const,
          message: res.message || "Failed to create task",
        };
      }

      setTasks((prev) => {
        const created = res.data as Task;
        const without = prev.filter((t) => t.id !== created.id);
        return [created, ...without];
      });
      toast.success("Task created");
      return { success: true as const };
    } catch {
      return { success: false as const, message: "Failed to create task" };
    }
  }, []);

  const saveEdit = useCallback(
    async (values: TaskEditInput) => {
      if (!editTask)
        return { success: false as const, message: "No task selected" };
      try {
        const patchRes = await taskService.updateTask(editTask.id, {
          title: values.title.trim(),
          description: values.description?.trim() ? values.description.trim() : null,
          status: values.status,
        });

        if (!patchRes.success || !patchRes.data) {
          return {
            success: false as const,
            message: patchRes.message || "Failed to update task",
          };
        }

        let merged = patchRes.data as Task;
        const prevAssignee = editTask.assigneeId ?? null;
        const nextAssignee = values.assigneeId ?? null;
        if (prevAssignee !== nextAssignee) {
          const assignRes = await taskService.assignTask(editTask.id, nextAssignee);
          if (!assignRes.success || !assignRes.data) {
            return {
              success: false as const,
              message: assignRes.message || "Failed to update assignee",
            };
          }
          merged = assignRes.data as Task;
        }

        setTasks((prev) => prev.map((t) => (t.id === merged.id ? merged : t)));
        toast.success("Task updated");
        return { success: true as const };
      } catch {
        return { success: false as const, message: "Failed to update task" };
      }
    },
    [editTask],
  );

  const editDefaultValues = useMemo(() => {
    if (!editTask) return null;
    return {
      title: editTask.title,
      description: editTask.description ?? "",
      status: editTask.status,
      assigneeId: editTask.assigneeId ?? null,
    };
  }, [editTask]);

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return;
    setDeleteSubmitting(true);
    try {
      const res = await taskService.deleteTask(pendingDelete.id);
      if (!res.success) {
        toast.error(res.message || "Failed to delete task");
        return;
      }

      setTasks((prev) => prev.filter((t) => t.id !== pendingDelete.id));
      setPendingDelete(null);
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    } finally {
      setDeleteSubmitting(false);
    }
  }, [pendingDelete]);

  const updateStatus = useCallback(
    async (taskId: string, status: TaskStatus) => {
      try {
        const res = await taskService.updateStatus(taskId, status);
        if (!res.success || !res.data) {
          toast.error(res.message || "Failed to update task");
          return;
        }

        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? (res.data as Task) : t)),
        );
      } catch {
        toast.error("Failed to update task");
      }
    },
    [],
  );

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
    const seen = new Set<string>();
    for (const t of filteredTasks) {
      if (seen.has(t.id)) continue;
      seen.add(t.id);
      map[t.status].push(t);
    }
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

      await updateStatus(activeTaskId, nextStatus);
    },
    [tasks, updateStatus, statuses],
  );

  const canManage = useCallback(
    (task: Task) => canUserManageTask(task, currentUserId, currentRole),
    [currentUserId, currentRole],
  );

  return (
    <>
      <div className="space-y-6 w-full min-w-0">
        <TaskBoardHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          loading={loading}
          onRefresh={loadTasks}
          onNewTask={() => {
            setCreateOpen(true);
          }}
        />

        <TasksKanbanBoard
          tasksByStatus={tasksByStatus}
          statuses={statuses}
          onDragEnd={handleDragEnd}
          canManage={canManage}
          onEdit={openEdit}
          onDelete={setPendingDelete}
        />
      </div>

      <TaskCreateDialog
        open={createOpen}
        onOpenChangeAction={setCreateOpen}
        assignableUsers={assignableUsers}
        statuses={statuses}
        onSubmitAction={createTask}
      />

      <TaskEditDialog
        open={editOpen}
        onOpenChangeAction={(open) => {
          setEditOpen(open);
          if (!open) setEditTask(null);
        }}
        defaultValues={editDefaultValues}
        assignableUsers={assignableUsers}
        statuses={statuses}
        onSubmitAction={saveEdit}
      />

      <TaskDeleteDialog
        task={pendingDelete}
        open={pendingDelete !== null}
        onOpenChangeAction={(open) => {
          if (!open) setPendingDelete(null);
        }}
        onConfirmAction={confirmDelete}
        submitting={deleteSubmitting}
      />
    </>
  );
}
