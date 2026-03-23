"use client";

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
import { Label } from "@repo/shadcn-ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/shadcn-ui/select";
import { Textarea } from "@repo/shadcn-ui/textarea";
import {
  type AssignableUser,
  type TaskStatus,
  taskColumnLabel,
} from "@repo/types";

const UNASSIGNED = "__none__";

export type TaskCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onTitleChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  status: TaskStatus;
  onStatusChange: (value: TaskStatus) => void;
  assigneeId: string;
  onAssigneeIdChange: (value: string) => void;
  assignableUsers: AssignableUser[];
  statuses: readonly TaskStatus[];
  onSubmit: () => void;
  submitting: boolean;
  submitDisabled: boolean;
};

export function TaskCreateDialog({
  open,
  onOpenChange,
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  status,
  onStatusChange,
  assigneeId,
  onAssigneeIdChange,
  assignableUsers,
  statuses,
  onSubmit,
  submitting,
  submitDisabled,
}: TaskCreateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void onSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>New task</DialogTitle>
            <DialogDescription>
              Add a title and optional details. Choose column and assignee.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="e.g. Review API design"
                autoFocus
                className="bg-white dark:bg-zinc-950/30"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="task-description">Description (optional)</Label>
              <Textarea
                id="task-description"
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="Add context or acceptance criteria..."
                rows={3}
                className="resize-y bg-white dark:bg-zinc-950/30"
              />
            </div>

            <div className="grid gap-2">
              <Label>Column</Label>
              <Select
                value={status}
                onValueChange={(v) => onStatusChange(v as TaskStatus)}
              >
                <SelectTrigger className="bg-white dark:bg-zinc-950/30">
                  <SelectValue placeholder="Column" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {taskColumnLabel(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Assignee (optional)</Label>
              <Select
                value={assigneeId || UNASSIGNED}
                onValueChange={(v) =>
                  onAssigneeIdChange(v === UNASSIGNED ? "" : v)
                }
              >
                <SelectTrigger className="bg-white dark:bg-zinc-950/30">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                  {assignableUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name?.trim() || u.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || submitDisabled}>
              {submitting ? "Creating…" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
