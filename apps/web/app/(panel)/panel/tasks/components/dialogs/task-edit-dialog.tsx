"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@repo/shadcn-ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/shadcn-ui/dialog";
import { Input } from "@repo/shadcn-ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/shadcn-ui/select";
import { Textarea } from "@repo/shadcn-ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/shadcn-ui/form";
import {
  type AssignableUser,
  type TaskStatus,
  taskColumnLabel,
} from "@repo/types";
import { taskEditSchema, type TaskEditInput } from "@repo/validations/task";

const UNASSIGNED = "__none__";

export type TaskEditDialogProps = {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  defaultValues: {
    title: string;
    description: string;
    status: TaskStatus;
    assigneeId: string | null;
  } | null;
  assignableUsers: AssignableUser[];
  statuses: readonly TaskStatus[];
  onSubmitAction: (
    values: TaskEditInput,
  ) => Promise<{ success: boolean; message?: string }>;
};

type TaskEditFormValues = z.input<typeof taskEditSchema>;

export function TaskEditDialog({
  open,
  onOpenChangeAction,
  defaultValues,
  assignableUsers,
  statuses,
  onSubmitAction,
}: TaskEditDialogProps) {
  const form = useForm<TaskEditFormValues>({
    resolver: zodResolver(taskEditSchema),
    defaultValues: useMemo(
      () => ({
        title: defaultValues?.title ?? "",
        description: defaultValues?.description ?? "",
        status: defaultValues?.status ?? "TODO",
        assigneeId: defaultValues?.assigneeId ?? null,
      }),
      [],
    ),
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const disabled = form.formState.isSubmitting;

  useEffect(() => {
    if (!open) return;
    if (!defaultValues) return;
    setSubmitError(null);
    form.reset({
      title: defaultValues.title,
      description: defaultValues.description,
      status: defaultValues.status,
      assigneeId: defaultValues.assigneeId,
    });
  }, [open, defaultValues, form]);

  const handleClose = (nextOpen: boolean) => {
    onOpenChangeAction(nextOpen);
    if (!nextOpen) {
      setSubmitError(null);
      form.reset();
    }
  };

  const handleValidSubmit = async (values: TaskEditFormValues) => {
    setSubmitError(null);
    const parsed = taskEditSchema.parse(values);
    const result = await onSubmitAction(parsed);
    if (result.success) {
      onOpenChangeAction(false);
      return;
    }
    setSubmitError(result.message || "Failed to update task");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit task</DialogTitle>
          <DialogDescription>
            Update details, column, or assignee. Only owners and admins can edit.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleValidSubmit)} className="grid gap-4 py-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="edit-task-title">Title</FormLabel>
                  <FormControl>
                    <Input
                      id="edit-task-title"
                      className="bg-white dark:bg-zinc-950/30"
                      disabled={disabled}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="edit-task-description">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      id="edit-task-description"
                      rows={3}
                      className="resize-y bg-white dark:bg-zinc-950/30"
                      disabled={disabled}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Column</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(v) => field.onChange(v as TaskStatus)}
                    disabled={disabled}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white dark:bg-zinc-950/30">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statuses.map((s) => (
                        <SelectItem key={s} value={s}>
                          {taskColumnLabel(s)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assigneeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignee</FormLabel>
                  <Select
                    value={field.value || UNASSIGNED}
                    onValueChange={(v) => field.onChange(v === UNASSIGNED ? null : v)}
                    disabled={disabled}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white dark:bg-zinc-950/30">
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                      {assignableUsers.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name?.trim() || u.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {submitError ? (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {submitError}
                </p>
              </div>
            ) : null}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={disabled}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={disabled}>
                {disabled ? "Saving…" : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
