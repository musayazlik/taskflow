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
import { taskCreateSchema, type TaskCreateInput } from "@repo/validations/task";

const UNASSIGNED = "__none__";

export type TaskCreateDialogProps = {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  assignableUsers: AssignableUser[];
  statuses: readonly TaskStatus[];
  onSubmitAction: (
    values: TaskCreateInput,
  ) => Promise<{ success: boolean; message?: string }>;
};

type TaskCreateFormValues = z.input<typeof taskCreateSchema>;

export function TaskCreateDialog({
  open,
  onOpenChangeAction,
  assignableUsers,
  statuses,
  onSubmitAction,
}: TaskCreateDialogProps) {
  const form = useForm<TaskCreateFormValues>({
    resolver: zodResolver(taskCreateSchema),
    defaultValues: useMemo(
      () => ({
        title: "",
        description: "",
        status: "TODO",
        assigneeId: null,
      }),
      [],
    ),
  });

  const [submitError, setSubmitError] = useState<string | null>(null);
  const disabled = form.formState.isSubmitting;

  useEffect(() => {
    if (!open) return;
    setSubmitError(null);
    form.reset({
      title: "",
      description: "",
      status: "TODO",
      assigneeId: null,
    });
  }, [open, form]);

  const handleClose = (nextOpen: boolean) => {
    onOpenChangeAction(nextOpen);
    if (!nextOpen) {
      setSubmitError(null);
      form.reset();
    }
  };

  const handleValidSubmit = async (values: TaskCreateFormValues) => {
    setSubmitError(null);
    const parsed = taskCreateSchema.parse(values);
    const result = await onSubmitAction(parsed);
    if (result.success) {
      onOpenChangeAction(false);
      form.reset();
      return;
    }
    setSubmitError(result.message || "Failed to create task");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
          <DialogDescription>
            Add a title and optional details. Choose column and assignee.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleValidSubmit)} className="grid gap-4 py-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="task-title">Title</FormLabel>
                  <FormControl>
                    <Input
                      id="task-title"
                      placeholder="e.g. Review API design"
                      autoFocus
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
                  <FormLabel htmlFor="task-description">
                    Description (optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      id="task-description"
                      placeholder="Add context or acceptance criteria..."
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
                        <SelectValue placeholder="Column" />
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
                  <FormLabel>Assignee (optional)</FormLabel>
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
                {disabled ? "Creating…" : "Create task"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
