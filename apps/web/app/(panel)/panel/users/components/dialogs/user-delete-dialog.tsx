"use client";

import { Trash2, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@repo/shadcn-ui/alert-dialog";

export interface UserDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  onConfirm: () => void;
  submitting: boolean;
}

function DialogHeaderComponent({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-2">
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/20">
        <span className="text-red-600 dark:text-red-400">{icon}</span>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
      </div>
    </div>
  );
}

export function UserDeleteDialog({
  open,
  onOpenChange,
  userName,
  onConfirm,
  submitting,
}: UserDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
        <AlertDialogHeader>
          <DialogHeaderComponent
            icon={<Trash2 className="h-5 w-5" />}
            title="Delete User"
          />
          <AlertDialogDescription className="text-gray-500 dark:text-gray-400">
            This will permanently delete{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {userName}
            </span>
            's account and all associated data. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel
            disabled={submitting}
            className="border-gray-200 dark:border-zinc-700 bg-transparent"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete User
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
