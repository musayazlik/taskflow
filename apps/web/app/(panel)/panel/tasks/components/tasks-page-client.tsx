"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { DragEndEvent } from "@dnd-kit/core";
import { toast } from "sonner";

import { apiClient } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import {
  type ApiResponse,
  type AssignableUser,
  type Task,
  type TaskStatus,
  type TasksListResponse,
  TASK_STATUSES,
  canUserManageTask,
} from "@repo/types";

import { TaskBoardHeader } from "./task-board-header";
import { TaskCreateDialog } from "./task-create-dialog";
import { TaskDeleteDialog } from "./task-delete-dialog";
import { TaskEditDialog } from "./task-edit-dialog";
import { TasksKanbanBoard } from "./tasks-kanban-board";

export function TasksPageClient() {
  const { data: session } = useSession();
  const sessionUser = session?.user as
    | { id?: string; role?: string }
    | undefined;
  const currentUserId = sessionUser?.id;
  const currentRole = sessionUser?.role;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [assignableUsers, setAssignableUsers] = useState<AssignableUser[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newStatus, setNewStatus] = useState<TaskStatus>("TODO");
  const [newAssigneeId, setNewAssigneeId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<TaskStatus>("TODO");
  const [editAssigneeId, setEditAssigneeId] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [pendingDelete, setPendingDelete] = useState<Task | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const statuses = useMemo(() => TASK_STATUSES, []);

  const loadAssignableUsers = useCallback(async () => {
    try {
      const res = (await apiClient.get<ApiResponse<AssignableUser[]>>(
        "/api/tasks/assignable-users",
      )) as ApiResponse<AssignableUser[]>;
      if (res?.success && Array.isArray(res.data)) {
        setAssignableUsers(res.data);
      }
    } catch {
      /* optional */
    }
  }, []);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = (await apiClient.get<TasksListResponse>(
        "/api/tasks?page=1&limit=50",
      )) as unknown as TasksListResponse;
      if (!res?.success || !Array.isArray(res.data)) {
        toast.error(res?.message || "Failed to load tasks");
        setTasks([]);
        return;
      }
      setTasks(res.data);
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

  const resetCreateForm = useCallback(() => {
    setNewTitle("");
    setNewDescription("");
    setNewStatus("TODO");
    setNewAssigneeId("");
  }, []);

  const openEdit = useCallback((task: Task) => {
    setEditTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description ?? "");
    setEditStatus(task.status);
    setEditAssigneeId(task.assigneeId ?? "");
    setEditOpen(true);
  }, []);

  const createTask = useCallback(async () => {
    const title = newTitle.trim();
    if (!title) {
      toast.error("Title is required");
      return;
    }

    setCreateSubmitting(true);
    try {
      const res = await apiClient.post<ApiResponse<Task>>("/api/tasks", {
        title,
        description: newDescription.trim() ? newDescription.trim() : undefined,
        status: newStatus,
        assigneeId: newAssigneeId ? newAssigneeId : undefined,
      });

      if (!res?.success || !res.data) {
        toast.error(res?.message || "Failed to create task");
        return;
      }

      resetCreateForm();
      setCreateOpen(false);
      setTasks((prev) => [res.data as Task, ...prev]);
      toast.success("Task created");
    } catch {
      toast.error("Failed to create task");
    } finally {
      setCreateSubmitting(false);
    }
  }, [newTitle, newDescription, newStatus, newAssigneeId, resetCreateForm]);

  const saveEdit = useCallback(async () => {
    if (!editTask) return;
    const title = editTitle.trim();
    if (!title) {
      toast.error("Title is required");
      return;
    }

    setEditSubmitting(true);
    try {
      const patchRes = await apiClient.patch<ApiResponse<Task>>(
        `/api/tasks/${editTask.id}`,
        {
          title,
          description: editDescription.trim() ? editDescription.trim() : null,
          status: editStatus,
        },
      );

      if (!patchRes?.success || !patchRes.data) {
        toast.error(patchRes?.message || "Failed to update task");
        return;
      }

      let merged = patchRes.data as Task;
      const prevAssignee = editTask.assigneeId ?? null;
      const nextAssignee = editAssigneeId === "" ? null : editAssigneeId;
      if (prevAssignee !== nextAssignee) {
        const assignRes = await apiClient.post<ApiResponse<Task>>(
          `/api/tasks/${editTask.id}/assign`,
          { assigneeId: nextAssignee },
        );
        if (!assignRes?.success || !assignRes.data) {
          toast.error(assignRes?.message || "Failed to update assignee");
          return;
        }
        merged = assignRes.data as Task;
      }

      setTasks((prev) =>
        prev.map((t) => (t.id === merged.id ? merged : t)),
      );
      setEditOpen(false);
      setEditTask(null);
      toast.success("Task updated");
    } catch {
      toast.error("Failed to update task");
    } finally {
      setEditSubmitting(false);
    }
  }, [
    editTask,
    editTitle,
    editDescription,
    editStatus,
    editAssigneeId,
  ]);

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return;
    setDeleteSubmitting(true);
    try {
      const res = (await apiClient.delete<ApiResponse<{ id: string }>>(
        `/api/tasks/${pendingDelete.id}`,
      )) as ApiResponse<{ id: string }>;

      if (!res?.success) {
        toast.error(res?.message || "Failed to delete task");
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
        const res = await apiClient.patch<ApiResponse<Task>>(
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

      await updateStatus(activeTaskId, nextStatus);
    },
    [tasks, updateStatus, statuses],
  );

  const canManage = useCallback(
    (task: Task) =>
      canUserManageTask(task, currentUserId, currentRole),
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
            resetCreateForm();
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
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) resetCreateForm();
        }}
        title={newTitle}
        onTitleChange={setNewTitle}
        description={newDescription}
        onDescriptionChange={setNewDescription}
        status={newStatus}
        onStatusChange={setNewStatus}
        assigneeId={newAssigneeId}
        onAssigneeIdChange={setNewAssigneeId}
        assignableUsers={assignableUsers}
        statuses={statuses}
        onSubmit={createTask}
        submitting={createSubmitting}
        submitDisabled={loading}
      />

      <TaskEditDialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditTask(null);
        }}
        title={editTitle}
        onTitleChange={setEditTitle}
        description={editDescription}
        onDescriptionChange={setEditDescription}
        status={editStatus}
        onStatusChange={setEditStatus}
        assigneeId={editAssigneeId}
        onAssigneeIdChange={setEditAssigneeId}
        assignableUsers={assignableUsers}
        statuses={statuses}
        onSubmit={saveEdit}
        submitting={editSubmitting}
      />

      <TaskDeleteDialog
        task={pendingDelete}
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        onConfirm={confirmDelete}
        submitting={deleteSubmitting}
      />
    </>
  );
}
