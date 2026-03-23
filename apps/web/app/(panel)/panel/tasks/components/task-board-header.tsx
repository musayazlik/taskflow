"use client";

import { Button } from "@repo/shadcn-ui/button";
import { Input } from "@repo/shadcn-ui/input";
import { cn } from "@/lib/utils";
import { Plus, RefreshCw, Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

export type TaskBoardHeaderProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  loading: boolean;
  onRefresh: () => void;
  onNewTask: () => void;
};

export function TaskBoardHeader({
  searchQuery,
  onSearchChange,
  loading,
  onRefresh,
  onNewTask,
}: TaskBoardHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Tasks
          </div>
          <div className="text-lg font-semibold text-zinc-900 sm:text-xl dark:text-zinc-100">
            Kanban Board
          </div>
          <p className="mt-1 text-xs text-zinc-500 md:hidden dark:text-zinc-400">
            Swipe horizontally to move between columns.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        <div className="relative w-full lg:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 bg-white border-zinc-200 text-zinc-900 dark:bg-zinc-950/30 dark:border-zinc-800 dark:text-zinc-200"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 min-w-[120px] bg-white border-zinc-200 text-zinc-900 sm:flex-none dark:bg-zinc-950/30 dark:border-zinc-800 dark:text-zinc-200"
            onClick={() => toast.message("Filters coming soon")}
          >
            <SlidersHorizontal className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Filters</span>
            <span className="sm:hidden">Filter</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0 bg-white border-zinc-200 text-zinc-900 dark:bg-zinc-950/30 dark:border-zinc-800 dark:text-zinc-200"
            onClick={() => void onRefresh()}
            aria-label="Refresh task list"
            disabled={loading}
          >
            <RefreshCw
              className={cn("h-4 w-4", loading && "animate-spin")}
            />
          </Button>

          <Button
            type="button"
            className="flex-1 min-w-[140px] bg-indigo-600 hover:bg-indigo-700 text-white sm:flex-none"
            disabled={loading}
            onClick={onNewTask}
          >
            <Plus className="h-4 w-4 mr-2 shrink-0" />
            New task
          </Button>
        </div>
      </div>
    </div>
  );
}
