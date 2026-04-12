"use client";

import { useCallback, useEffect, useState } from "react";


import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/shadcn-ui/tabs";
import { PageHeader } from "@/components/panel/page-header";
import {
  Bell,
  Check,
  Settings,
  Globe,
  Shield,
  CreditCard,
  Users,
  Zap,
  RefreshCw,
  BellRing,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { StatsGrid, type StatItem } from "@/components/stats";
import { useSession } from "@/lib/auth-client";
import { useSocketRealtime } from "@/lib/socket/use-socket-realtime";
import type {
  NotificationRealtimeMessage,
  NotificationsFilter,
  UiNotification,
} from "@repo/types";
import { notificationService } from "@/services";

import { NotificationsTab } from "./organisms/notifications-tab";
import { PreferencesTab } from "./organisms/preferences-tab";

function formatTaskNotificationForPage(message: string): {
  title: string;
  detailedMessage: string;
} {
  const restClean = (value: string): string => {
    const t = value.trim();
    if (!t) return "";
    if (t.startsWith("(") && t.endsWith(")")) return t.slice(1, -1).trim();
    return t;
  };

  const created = message.match(
    /^Task created:\s*(.+?)\s*\((TODO|IN_PROGRESS|DONE)\)(.*)$/,
  );
  if (created) {
    const taskTitle = (created[1] ?? "").trim();
    const status = created[2] ?? "TODO";
    const rest = restClean(created[3] ?? "");
    return {
      title: taskTitle,
      detailedMessage: rest
        ? `Task created · ${status} · ${rest}`
        : `Task created · ${status}`,
    };
  }

  const updated = message.match(
    /^Task updated:\s*(.+?)\s*\((TODO|IN_PROGRESS|DONE)\)(.*)$/,
  );
  if (updated) {
    const taskTitle = (updated[1] ?? "").trim();
    const status = updated[2] ?? "TODO";
    const rest = restClean(updated[3] ?? "");
    return {
      title: taskTitle,
      detailedMessage: rest
        ? `Task updated · ${status} · ${rest}`
        : `Task updated · ${status}`,
    };
  }

  const deleted = message.match(
    /^Task deleted:\s*(.+?)\s*\((TODO|IN_PROGRESS|DONE)\)(.*)$/,
  );
  if (deleted) {
    const taskTitle = (deleted[1] ?? "").trim();
    const status = deleted[2] ?? "TODO";
    const rest = restClean(deleted[3] ?? "");
    return {
      title: taskTitle,
      detailedMessage: rest
        ? `Task deleted · ${status} · ${rest}`
        : `Task deleted · ${status}`,
    };
  }

  const assignedTo = message.match(
    /^Task assigned to (.+?):\s*(.+?)\s*\((TODO|IN_PROGRESS|DONE)\)(.*)$/,
  );
  if (assignedTo) {
    const assigneeName = (assignedTo[1] ?? "").trim();
    const taskTitle = (assignedTo[2] ?? "").trim();
    const status = assignedTo[3] ?? "TODO";
    const rest = restClean(assignedTo[4] ?? "");
    const action = `Assigned to ${assigneeName}`;
    return {
      title: taskTitle,
      detailedMessage: rest
        ? `${action} · ${status} · ${rest}`
        : `${action} · ${status}`,
    };
  }

  const unassigned = message.match(
    /^Task unassigned:\s*(.+?)\s*\((TODO|IN_PROGRESS|DONE)\)(.*)$/,
  );
  if (unassigned) {
    const taskTitle = (unassigned[1] ?? "").trim();
    const status = unassigned[2] ?? "TODO";
    const rest = restClean(unassigned[3] ?? "");
    const action = "Unassigned";
    return {
      title: taskTitle,
      detailedMessage: rest
        ? `${action} · ${status} · ${rest}`
        : `${action} · ${status}`,
    };
  }

  const reassignedTo = message.match(
    /^Task reassigned to (.+?):\s*(.+?)\s*\((TODO|IN_PROGRESS|DONE)\)(.*)$/,
  );
  if (reassignedTo) {
    const assigneeName = (reassignedTo[1] ?? "").trim();
    const taskTitle = (reassignedTo[2] ?? "").trim();
    const status = reassignedTo[3] ?? "TODO";
    const rest = restClean(reassignedTo[4] ?? "");
    const action = `Reassigned to ${assigneeName}`;
    return {
      title: taskTitle,
      detailedMessage: rest
        ? `${action} · ${status} · ${rest}`
        : `${action} · ${status}`,
    };
  }

  const assignmentUpdated = message.match(
    /^Task assignment updated:\s*(.+?)\s*\((TODO|IN_PROGRESS|DONE)\)(.*)$/,
  );
  if (assignmentUpdated) {
    const taskTitle = (assignmentUpdated[1] ?? "").trim();
    const status = assignmentUpdated[2] ?? "TODO";
    const rest = restClean(assignmentUpdated[3] ?? "");
    return {
      title: taskTitle,
      detailedMessage: rest
        ? `Assignment updated · ${status} · ${rest}`
        : `Assignment updated · ${status}`,
    };
  }

  const youAssigned = message.match(
    /^You were assigned a task:\s*(.+?)\s*\((TODO|IN_PROGRESS|DONE)\)(.*)$/,
  );
  if (youAssigned) {
    const taskTitle = (youAssigned[1] ?? "").trim();
    const status = youAssigned[2] ?? "TODO";
    const rest = restClean(youAssigned[3] ?? "");
    return {
      title: taskTitle,
      detailedMessage: rest
        ? `Assigned · ${status} · ${rest}`
        : `Assigned · ${status}`,
    };
  }

  const youUnassigned = message.match(
    /^You were unassigned a task:\s*(.+?)\s*\((TODO|IN_PROGRESS|DONE)\)(.*)$/,
  );
  if (youUnassigned) {
    const taskTitle = (youUnassigned[1] ?? "").trim();
    const status = youUnassigned[2] ?? "TODO";
    const rest = restClean(youUnassigned[3] ?? "");
    return {
      title: taskTitle,
      detailedMessage: rest
        ? `Unassigned · ${status} · ${rest}`
        : `Unassigned · ${status}`,
    };
  }

  return { title: message, detailedMessage: message };
}

export function NotificationsPageClient() {
  const { data: session } = useSession();
  const sessionUser = session?.user as
    | { id?: string; role?: string }
    | undefined;
  const currentUserId = sessionUser?.id;
  const currentRole = sessionUser?.role;

  const [activeTab, setActiveTab] = useState<NotificationsFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    [],
  );
  const [notifications, setNotifications] = useState<UiNotification[]>([]);
  const [readNotifications, setReadNotifications] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications();
      const payload = res.success && res.data ? res.data : null;

      const backend = Array.isArray(payload?.data?.notifications)
        ? (payload!.data!.notifications as Array<unknown>)
        : [];

      // Backend notification shape:
      // { id, type, message, read, createdAt, taskId? }
      const mapped: UiNotification[] = backend.map((n) => {
        const record = n as {
          id: string | number;
          type: string;
          message: string;
          read: boolean;
          createdAt: string | Date;
        };

        const uiType: UiNotification["type"] =
        record.message.startsWith("Task deleted:")
          ? "error"
          : record.type === "TASK_CREATED"
            ? "success"
            : record.type === "TASK_UPDATED"
              ? "info"
              : "warning";

        const time = new Date(record.createdAt).toLocaleString();

        const formatted = formatTaskNotificationForPage(record.message);

        return {
          id: String(record.id),
          title: formatted.title,
          message: formatted.detailedMessage,
          type: uiType,
          category: "Tasks",
          time,
        };
      });

      setNotifications(mapped);
      setReadNotifications(
        backend
          .filter((n) => (n as { read: boolean }).read)
          .map((n) => String((n as { id: string | number }).id)),
      );
    } catch {
      setNotifications([]);
      setReadNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  useSocketRealtime<NotificationRealtimeMessage, UiNotification[]>({
    enabled: !!currentUserId,
    userId: currentUserId,
    role: currentRole,
    event: "notifications:mutation",
    setStateAction: setNotifications,
    applyMessageAction: (prev, message) => {
      const record = message.notification;
      const uiType: UiNotification["type"] =
        record.message.startsWith("Task deleted:")
          ? "error"
          : record.type === "TASK_CREATED"
            ? "success"
            : record.type === "TASK_UPDATED"
              ? "info"
              : "warning";

      const time = record.createdAt
        ? new Date(record.createdAt).toLocaleString()
        : "";

      const formatted = formatTaskNotificationForPage(record.message);

      const incoming: UiNotification = {
        id: record.id,
        title: formatted.title,
        message: formatted.detailedMessage,
        type: uiType,
        category: "Tasks",
        time,
      };

      setReadNotifications((prevRead) => {
        const set = new Set(prevRead);
        if (record.read) set.add(incoming.id);
        else set.delete(incoming.id);
        return Array.from(set);
      });

      if (message.type === "created") {
        const without = prev.filter((n) => n.id !== incoming.id);
        return [incoming, ...without];
      }

      const idx = prev.findIndex((n) => n.id === incoming.id);
      if (idx === -1) return [incoming, ...prev];
      const next = [...prev];
      next[idx] = incoming;
      return next;
    },
  });

  const [preferences, setPreferences] = useState([
    {
      id: "payments",
      title: "Payment Notifications",
      description:
        "Get notified about payment transactions and billing updates",
      icon: CreditCard,
      email: true,
      push: true,
      inApp: true,
    },
    {
      id: "users",
      title: "User Activity",
      description: "Notifications about new user registrations and activities",
      icon: Users,
      email: false,
      push: true,
      inApp: true,
    },
    {
      id: "security",
      title: "Security Alerts",
      description: "Important security updates, login attempts, and warnings",
      icon: Shield,
      email: true,
      push: true,
      inApp: true,
    },
    {
      id: "system",
      title: "System Updates",
      description: "Maintenance schedules and system announcements",
      icon: Zap,
      email: false,
      push: false,
      inApp: true,
    },
    {
      id: "marketing",
      title: "Marketing & Promotions",
      description: "News, updates, and promotional offers",
      icon: Globe,
      email: false,
      push: false,
      inApp: false,
    },
  ]);

  const markAsRead = (id: string) => {
    if (readNotifications.includes(id)) return;

    // Optimistic update
    setReadNotifications((prev) => [...prev, id]);

    void notificationService.markAsRead(id).then((res) => {
      if (res.success) {
        toast.success("Marked as read");
        return;
      }
      toast.error(res.message || "Failed to mark as read");
      // We intentionally keep optimistic UI; next refresh will sync.
    });
  };

  const markAllAsRead = () => {
    const ids = notifications.map((n) => String(n.id));
    const unreadIds = ids.filter((id) => !readNotifications.includes(id));

    if (unreadIds.length === 0) return;

    // Optimistic update
    setReadNotifications(ids);
    toast.success("Marking all as read...");

    void notificationService.markManyAsRead(unreadIds).then((res) => {
      if (!res.success) {
        toast.error(res.message || "Failed to mark all as read");
        return;
      }
      toast.success("All notifications marked as read");
      void loadNotifications();
    });
  };

  const togglePreference = (
    prefId: string,
    type: "email" | "push" | "inApp",
  ) => {
    setPreferences((prev) =>
      prev.map((p) => (p.id === prefId ? { ...p, [type]: !p[type] } : p)),
    );
  };

  const setAllChannel = (type: "email" | "push" | "inApp", enabled: boolean) => {
    setPreferences((prev) => prev.map((p) => ({ ...p, [type]: enabled })));
  };

  // Calculate stats
  const unreadCount = notifications.filter(
    (n) => !readNotifications.includes(String(n.id)),
  ).length;
  const warningCount = notifications.filter((n) => n.type === "warning").length;
  const errorCount = notifications.filter((n) => n.type === "error").length;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Bell}
        title="Notifications"
        description="Manage your notifications and preferences"
        actions={[
          {
            label: "Refresh",
            icon: <RefreshCw className="h-4 w-4" />,
            onClick: () => {
              void loadNotifications();
              toast.success("Refreshed");
            },
            variant: "outline",
            className: "",
          },
          {
            label: "Mark all read",
            icon: <Check className="h-4 w-4" />,
            onClick: markAllAsRead,
            variant: "outline",
            disabled:
              notifications.filter(
                (n) => !readNotifications.includes(String(n.id)),
              ).length === 0,
          },
        ]}
      />

      <StatsGrid
        items={[
          {
            label: "Total",
            value: notifications.length,
            icon: Bell,
            color: "violet",
            trend: "+12%",
          },
          {
            label: "Unread",
            value: unreadCount,
            icon: BellRing,
            color: "blue",
            trend: unreadCount > 0 ? "+5%" : "0%",
          },
          {
            label: "Warnings",
            value: warningCount,
            icon: AlertTriangle,
            color: "amber",
            trend: "+8%",
          },
          {
            label: "Errors",
            value: errorCount,
            icon: AlertCircle,
            color: "red",
            trend: "+2%",
          },
        ] satisfies StatItem[]}
      />

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Settings className="h-4 w-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationsTab
            notifications={notifications}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedNotifications={selectedNotifications}
            setSelectedNotifications={setSelectedNotifications}
            readNotifications={readNotifications}
            markAsRead={markAsRead}
          />
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <PreferencesTab
            preferences={preferences}
            togglePreference={togglePreference}
            setAllChannel={setAllChannel}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
