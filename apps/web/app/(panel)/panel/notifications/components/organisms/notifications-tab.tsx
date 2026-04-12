"use client";

import { useMemo } from "react";
import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/shadcn-ui/card";
import { Button } from "@repo/shadcn-ui/button";
import { Badge } from "@repo/shadcn-ui/badge";
import { Input } from "@repo/shadcn-ui/input";
import { ScrollArea } from "@repo/shadcn-ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/shadcn-ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Search,
  Filter,
  Trash2,
  Clock,
  BellOff,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import { NotificationItem } from "../molecules/notification-item";
import type { NotificationsFilter, UiNotification } from "@repo/types";

interface NotificationsTabProps {
  notifications: UiNotification[];
  activeTab: NotificationsFilter;
  setActiveTab: (tab: NotificationsFilter) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedNotifications: string[];
  setSelectedNotifications: React.Dispatch<React.SetStateAction<string[]>>;
  readNotifications: string[];
  markAsRead: (id: string) => void;
}

export function NotificationsTab({
  notifications,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  selectedNotifications,
  setSelectedNotifications,
  readNotifications,
  markAsRead,
}: NotificationsTabProps) {
  const unreadCount = notifications.filter(
    (n) => !readNotifications.includes(String(n.id)),
  ).length;
  const successCount = notifications.filter((n) => n.type === "success").length;
  const warningCount = notifications.filter((n) => n.type === "warning").length;
  const errorCount = notifications.filter((n) => n.type === "error").length;

  const tabs = [
    { id: "all" as const, label: "All", count: notifications.length },
    { id: "unread" as const, label: "Unread", count: unreadCount },
    {
      id: "success" as const,
      label: "Success",
      count: successCount,
      color: "text-emerald-500",
    },
    {
      id: "warning" as const,
      label: "Warning",
      count: warningCount,
      color: "text-amber-500",
    },
    {
      id: "error" as const,
      label: "Error",
      count: errorCount,
      color: "text-red-500",
    },
  ];

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !n.title.toLowerCase().includes(query) &&
          !n.message.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      switch (activeTab) {
        case "unread":
          return !readNotifications.includes(String(n.id));
        case "success":
          return n.type === "success";
        case "warning":
          return n.type === "warning";
        case "error":
          return n.type === "error";
        case "info":
          return n.type === "info";
        default:
          return true;
      }
    });
  }, [notifications, searchQuery, activeTab, readNotifications]);

  const toggleSelection = (id: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id],
    );
  };

  const deleteNotification = (id: string) => {
    setSelectedNotifications((prev) => prev.filter((n) => n !== id));
  };

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-zinc-800 rounded-lg overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap",
                    activeTab === tab.id
                      ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white",
                  )}
                >
                  <span className={tab.color}>{tab.label}</span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "h-5 min-w-5 px-1.5 text-xs",
                      activeTab === tab.id && "bg-primary/10 text-primary",
                    )}
                  >
                    {tab.count}
                  </Badge>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 flex-1 lg:justify-end">
              <div className="relative flex-1 lg:max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Clock className="h-4 w-4 mr-2" />
                    Sort by date
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Eye className="h-4 w-4 mr-2" />
                    Show read
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Hide read
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {selectedNotifications.length > 0 && (
            <div className="flex items-center gap-2 mt-4 p-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg border border-violet-200 dark:border-violet-800">
              <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
                {selectedNotifications.length} selected
              </span>
              <div className="flex-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedNotifications([])}
              >
                Clear
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  selectedNotifications.forEach(markAsRead);
                  setSelectedNotifications([]);
                }}
              >
                <Check className="h-4 w-4 mr-1" />
                Mark read
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">All Notifications</CardTitle>
              <CardDescription>
                {filteredNotifications.length} notification(s) found
              </CardDescription>
            </div>
            {filteredNotifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear all
              </Button>
            )}
          </div>
        </CardHeader>
        <ScrollArea className="h-[500px]">
          <CardContent>
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 dark:bg-zinc-800 mb-4">
                  <BellOff className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No notifications
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "You're all caught up! No notifications to show."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => {
                  const isRead = readNotifications.includes(
                    String(notification.id),
                  );
                  const isSelected = selectedNotifications.includes(
                    String(notification.id),
                  );

                  return (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      isRead={isRead}
                      isSelected={isSelected}
                      onToggleSelection={() =>
                        toggleSelection(String(notification.id))
                      }
                      onMarkAsRead={() => markAsRead(String(notification.id))}
                      onDelete={() => deleteNotification(String(notification.id))}
                    />
                  );
                })}
              </div>
            )}
          </CardContent>
        </ScrollArea>
      </Card>
    </>
  );
}
