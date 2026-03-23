"use client";

import { Button } from "@repo/shadcn-ui/button";
import { Input } from "@repo/shadcn-ui/input";
import { cn } from "@/lib/utils";
import { ArrowRightLeft, Plus, RefreshCw, Search, SlidersHorizontal } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
            Workspace
          </p>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl dark:text-zinc-50">
              Kanban board
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Plan work in columns, drag cards between stages, and keep the board
              in sync in real time. On smaller screens, scroll{" "}
              <span className="whitespace-nowrap font-medium text-zinc-800 dark:text-zinc-200">
                <ArrowRightLeft className="inline h-3.5 w-3.5 align-text-bottom" />{" "}
                sideways
              </span>{" "}
              to see every column.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-zinc-200 bg-white/90 px-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50"
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
            className="rounded-full border-zinc-200 bg-white/90 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50"
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
            className="rounded-full bg-indigo-600 px-5 shadow-md shadow-indigo-500/20 hover:bg-indigo-700 dark:shadow-indigo-900/30"
            disabled={loading}
            onClick={onNewTask}
          >
            <Plus className="h-4 w-4 mr-2 shrink-0" />
            New task
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title or description…"
          className="h-12 w-full rounded-2xl border-zinc-200 bg-white/90 pl-11 pr-4 text-base shadow-sm placeholder:text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950/40 dark:placeholder:text-zinc-500"
        />
      </div>
    </div>
  );
}
