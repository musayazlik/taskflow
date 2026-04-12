import { apiClient, buildApiQuery } from "@/lib/api";
import type { ApiResponse } from "@repo/types";
import type { AssignableUser, Task, TasksListResponse, TaskStatus } from "@repo/types";

export const taskService = {
  async getTasks(params?: { page?: number; limit?: number }): Promise<ApiResponse<TasksListResponse>> {
    try {
      const query = buildApiQuery({
        page: params?.page?.toString(),
        limit: params?.limit?.toString(),
      });

      const response = await apiClient.get<TasksListResponse>(`/api/tasks${query}`);

      if (!response?.success) {
        return {
          success: false,
          error: "Request failed",
          message: response?.message || "Failed to load tasks",
        };
      }

      return { success: true, data: response };
    } catch {
      return {
        success: false,
        error: "Network Error",
        message: "Failed to connect to server",
      };
    }
  },

  async getAssignableUsers(): Promise<ApiResponse<AssignableUser[]>> {
    try {
      const response = await apiClient.get<ApiResponse<AssignableUser[]>>(
        "/api/tasks/assignable-users",
      );

      if (!response?.success) {
        return {
          success: false,
          error: response?.error || "Request failed",
          message: response?.message || "Failed to fetch assignable users",
        };
      }

      return { success: true, data: (response.data || []) as AssignableUser[] };
    } catch {
      return {
        success: false,
        error: "Network Error",
        message: "Failed to connect to server",
      };
    }
  },

  async createTask(body: {
    title: string;
    description?: string;
    status: TaskStatus;
    assigneeId?: string;
  }): Promise<ApiResponse<Task>> {
    try {
      const response = await apiClient.post<ApiResponse<Task>>("/api/tasks", body);

      if (!response?.success || !response.data) {
        return {
          success: false,
          error: response?.error || "Request failed",
          message: response?.message || "Failed to create task",
        };
      }

      return { success: true, data: response.data as Task, message: response.message };
    } catch {
      return { success: false, error: "Network Error", message: "Failed to connect to server" };
    }
  },

  async updateTask(
    taskId: string,
    body: { title: string; description: string | null; status: TaskStatus },
  ): Promise<ApiResponse<Task>> {
    try {
      const response = await apiClient.patch<ApiResponse<Task>>(`/api/tasks/${taskId}`, body);

      if (!response?.success || !response.data) {
        return {
          success: false,
          error: response?.error || "Request failed",
          message: response?.message || "Failed to update task",
        };
      }

      return { success: true, data: response.data as Task, message: response.message };
    } catch {
      return { success: false, error: "Network Error", message: "Failed to connect to server" };
    }
  },

  async updateStatus(taskId: string, status: TaskStatus): Promise<ApiResponse<Task>> {
    try {
      const response = await apiClient.patch<ApiResponse<Task>>(`/api/tasks/${taskId}`, {
        status,
      });

      if (!response?.success || !response.data) {
        return {
          success: false,
          error: response?.error || "Request failed",
          message: response?.message || "Failed to update task",
        };
      }

      return { success: true, data: response.data as Task, message: response.message };
    } catch {
      return { success: false, error: "Network Error", message: "Failed to connect to server" };
    }
  },

  async assignTask(taskId: string, assigneeId: string | null): Promise<ApiResponse<Task>> {
    try {
      const response = await apiClient.post<ApiResponse<Task>>(
        `/api/tasks/${taskId}/assign`,
        { assigneeId },
      );

      if (!response?.success || !response.data) {
        return {
          success: false,
          error: response?.error || "Request failed",
          message: response?.message || "Failed to update assignee",
        };
      }

      return { success: true, data: response.data as Task, message: response.message };
    } catch {
      return { success: false, error: "Network Error", message: "Failed to connect to server" };
    }
  },

  async deleteTask(taskId: string): Promise<ApiResponse<{ id: string }>> {
    try {
      const response = (await apiClient.delete<ApiResponse<{ id: string }>>(
        `/api/tasks/${taskId}`,
      )) as ApiResponse<{ id: string }>;

      if (!response?.success) {
        return {
          success: false,
          error: response?.error || "Request failed",
          message: response?.message || "Failed to delete task",
        };
      }

      return { success: true, data: response.data as { id: string }, message: response.message };
    } catch {
      return { success: false, error: "Network Error", message: "Failed to connect to server" };
    }
  },
};

