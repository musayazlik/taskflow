"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/shadcn-ui/card";
import { Button } from "@repo/shadcn-ui/button";
import { Input } from "@repo/shadcn-ui/input";

import { toast } from "sonner";
import { ListTodo, Plus } from "lucide-react";

import { PageHeader } from "@/components/panel/page-header";
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

export function TasksPageClient() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingTitle, setCreatingTitle] = useState("");
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

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ListTodo}
        title="Tasks"
        description="Create, update and manage your tasks."
        actions={[
          {
            label: "Refresh",
            onClick: () => void loadTasks(),
            variant: "outline",
          },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Create Task</CardTitle>
          <CardDescription>Give it a title and it will appear in your list.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Input
            value={creatingTitle}
            onChange={(e) => setCreatingTitle(e.target.value)}
            placeholder="Task title"
          />
          <Button onClick={() => void createTask()} disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            Create
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {statuses.map((status) => (
          <Card key={status}>
            <CardHeader>
              <CardTitle className="capitalize">{status.replaceAll("_", " ")}</CardTitle>
              <CardDescription>
                {tasks.filter((t) => t.status === status).length} task(s)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks
                .filter((t) => t.status === status)
                .map((task) => (
                  <div key={task.id} className="rounded-lg border p-3">
                    <div className="font-medium">{task.title}</div>
                    {task.description ? (
                      <div className="text-sm text-muted-foreground mt-1">
                        {task.description}
                      </div>
                    ) : null}

                    <div className="flex flex-wrap gap-2 mt-3">
                      {statuses.map((s) => (
                        <Button
                          key={s}
                          size="sm"
                          variant={s === task.status ? "default" : "outline"}
                          onClick={() => void updateStatus(task.id, s)}
                        >
                          {s === "IN_PROGRESS" ? "In Progress" : s}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              {tasks.filter((t) => t.status === status).length === 0 ? (
                <div className="text-sm text-muted-foreground">No tasks yet.</div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

