export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export const isValidTaskStatus = (status: unknown): status is TaskStatus => {
  return (
    status === "TODO" ||
    status === "IN_PROGRESS" ||
    status === "DONE"
  );
};

/** Raw body before manual validation in controller */
export type CreateTaskBodyInput = {
  title?: unknown;
  description?: unknown;
  status?: unknown;
  assigneeId?: unknown;
};

export type UpdateTaskBodyInput = {
  title?: unknown;
  description?: unknown;
  status?: unknown;
};

export type AssignTaskBodyInput = {
  assigneeId?: unknown;
};

export type TaskListQuery = {
  page?: string;
  limit?: string;
  status?: string;
};
