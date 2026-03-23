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

export type TaskEditDialogProps = {
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
};

export function TaskEditDialog({
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
}: TaskEditDialogProps) {
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
            <DialogTitle>Edit task</DialogTitle>
            <DialogDescription>
              Update details, column, or assignee. Only owners and admins can
              edit.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-task-title">Title</Label>
              <Input
                id="edit-task-title"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                className="bg-white dark:bg-zinc-950/30"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-task-description">Description</Label>
              <Textarea
                id="edit-task-description"
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
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
                  <SelectValue />
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
              <Label>Assignee</Label>
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
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
