import { z } from "zod";

// ============================================
// Task Create Schema (Panel)
// ============================================
export const taskCreateSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .max(5000, "Description must be less than 5000 characters")
    .optional()
    .nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).default("TODO"),
  assigneeId: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
});

export type TaskCreateInput = z.infer<typeof taskCreateSchema>;

// ============================================
// Task Edit Schema (Panel)
// ============================================
export const taskEditSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .max(5000, "Description must be less than 5000 characters")
    .optional()
    .nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).default("TODO"),
  assigneeId: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
});

export type TaskEditInput = z.infer<typeof taskEditSchema>;

