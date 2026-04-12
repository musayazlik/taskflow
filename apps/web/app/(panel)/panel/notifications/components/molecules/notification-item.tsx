"use client";

import { Button } from "@repo/shadcn-ui/button";
import { Badge } from "@repo/shadcn-ui/badge";
import { Checkbox } from "@repo/shadcn-ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/shadcn-ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Clock, MoreHorizontal, Archive, Eye, Trash2 } from "lucide-react";
import { getNotificationIcon, getNotificationStyles } from "../utils";
import type { UiNotification } from "@repo/types";

interface NotificationItemProps {
  notification: UiNotification;
  isRead: boolean;
  isSelected: boolean;
  onToggleSelection: () => void;
  onMarkAsRead: () => void;
  onDelete: () => void;
}

export function NotificationItem({
  notification,
  isRead,
  isSelected,
  onToggleSelection,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const Icon = getNotificationIcon(notification.type);
  const styles = getNotificationStyles(notification.type);

  return (
    <div
      className={cn(
        "group relative flex items-start gap-4 p-4 rounded-xl border transition-all",
        !isRead
          ? `${styles.bg} ${styles.border}`
          : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700",
        isSelected && "ring-2 ring-primary",
      )}
    >
      <div className="pt-0.5">
        <Checkbox checked={isSelected} onCheckedChange={onToggleSelection} />
      </div>

      <div className={cn("shrink-0 p-2 rounded-lg", styles.bg)}>
        <Icon className={cn("h-5 w-5", styles.icon)} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3
            className={cn(
              "font-semibold text-sm",
              !isRead && "text-gray-900 dark:text-white",
            )}
          >
            {notification.title}
          </h3>
          {!isRead && (
            <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5 animate-pulse" />
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          {notification.message}
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            {notification.category}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{notification.time}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {!isRead && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onMarkAsRead}
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!isRead && (
              <DropdownMenuItem onClick={onMarkAsRead}>
                <Eye className="h-4 w-4 mr-2" />
                Mark as read
              </DropdownMenuItem>
            )}
            <DropdownMenuItem>
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
