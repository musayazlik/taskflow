"use client";

import { useState } from "react";
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
import { Switch } from "@repo/shadcn-ui/switch";
import { Label } from "@repo/shadcn-ui/label";
import { Checkbox } from "@repo/shadcn-ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/shadcn-ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/shadcn-ui/tabs";
import { cn } from "@/lib/utils";
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
import { PANEL_NOTIFICATIONS } from "@repo/types";
import { toast } from "sonner";
import { StatsGrid, type StatItem } from "@/components/stats";

import { NotificationsTab } from "./organisms/notifications-tab";
import { PreferencesTab } from "./organisms/preferences-tab";

// Convert readonly array to mutable array for component props
const notifications = [...PANEL_NOTIFICATIONS];

type NotificationType =
  | "all"
  | "unread"
  | "success"
  | "warning"
  | "error"
  | "info";

export function NotificationsPageClient() {
  const [activeTab, setActiveTab] = useState<NotificationType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    [],
  );
  const [readNotifications, setReadNotifications] = useState<string[]>(
    notifications.filter((n) => n.read).map((n) => String(n.id)),
  );
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
    if (!readNotifications.includes(id)) {
      setReadNotifications((prev) => [...prev, id]);
      toast.success("Marked as read");
    }
  };

  const markAllAsRead = () => {
    setReadNotifications(notifications.map((n) => String(n.id)));
    toast.success("All notifications marked as read");
  };

  const togglePreference = (
    prefId: string,
    type: "email" | "push" | "inApp",
  ) => {
    setPreferences((prev) =>
      prev.map((p) => (p.id === prefId ? { ...p, [type]: !p[type] } : p)),
    );
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
            onClick: () => toast.success("Refreshed"),
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
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
