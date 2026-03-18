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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/shadcn-ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/shadcn-ui/dropdown-menu";
import { PageHeader } from "@/components/panel/page-header";
import { StatsGrid } from "@/components/stats";
import {
  Shield,
  Lock,
  Key,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Globe,
  Smartphone,
  Monitor,
  Clock,
  MapPin,
  Search,
  RefreshCw,
  LogOut,
  Zap,
  Activity,
  FileText,
  Download,
  Filter,
  Mail,
} from "lucide-react";
import {
  PANEL_AUDIT_LOGS,
  PANEL_ACTIVE_SESSIONS,
  PANEL_SECURITY_ALERTS,
} from "@repo/types";
import { toast } from "sonner";

const auditLogs = PANEL_AUDIT_LOGS;
const activeSessions = PANEL_ACTIVE_SESSIONS;
const securityAlerts = PANEL_SECURITY_ALERTS;

export function SecurityPageClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginNotifications, setLoginNotifications] = useState(true);

  const activeAlertsCount = securityAlerts.filter((a) => !a.resolved).length;

  // Filter audit logs
  const filteredLogs = auditLogs.filter((log) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(query) ||
      log.user.toLowerCase().includes(query) ||
      log.ip.toLowerCase().includes(query)
    );
  });

  const handleRevokeSession = () => {
    toast.success("Session revoked successfully");
  };

  const handleResolveAlert = () => {
    toast.success("Alert resolved");
  };

  const handleExportLogs = () => {
    toast.success("Exporting audit logs...");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Shield}
        title="Security"
        description="Monitor security events and manage access"
        actions={[
          {
            label: "Refresh",
            icon: <RefreshCw className="h-4 w-4" />,
            onClick: () => toast.success("Refreshed"),
            variant: "outline",
          },
        ]}
      />

      {/* Stats Grid */}
      <StatsGrid
        items={[
          {
            label: "Total Sessions",
            value: 100,
            icon: Mail,
            color: "blue",
            trend: "+12%",
          },
          {
            label: "Total Alerts",
            value: 100,
            icon: Mail,
            color: "amber",
            trend: "+12%",
          },

          {
            label: "Total Logs",
            value: 100,
            icon: Mail,
            color: "gray",
            trend: "+12%",
          },
          {
            label: "Total Threats",
            value: 100,
            icon: Mail,
            color: "red",
            trend: "+12%",
          },
        ]}
        columns={{ default: 2, sm: 2, lg: 4 }}
        showTrends={false}
      />

      {/* Security Alerts */}
      {activeAlertsCount > 0 && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              Security Alerts
            </CardTitle>
            <CardDescription>
              Important security events that require your attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {securityAlerts
                .filter((alert) => !alert.resolved)
                .map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-4 p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-white dark:bg-zinc-900"
                  >
                    <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 shrink-0">
                      <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-1">
                        {alert.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {alert.message}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{alert.time}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResolveAlert()}
                    >
                      Resolve
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Active Sessions
            </CardTitle>
            <CardDescription>
              Devices currently logged into your account
            </CardDescription>
          </CardHeader>
          <ScrollArea className="h-[400px]">
            <CardContent>
              <div className="space-y-3">
                {activeSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between gap-4 p-4 rounded-xl border bg-white dark:bg-zinc-900 hover:border-gray-300 dark:hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 rounded-lg bg-gray-100 dark:bg-zinc-800 shrink-0">
                        {session.device.includes("iPhone") ||
                        session.device.includes("Android") ? (
                          <Smartphone className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        ) : (
                          <Monitor className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm truncate">
                            {session.device}
                          </p>
                          {session.current && (
                            <Badge variant="default" className="text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{session.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            <span className="truncate">{session.ip}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{session.lastActive}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {!session.current && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevokeSession()}
                      >
                        <LogOut className="h-4 w-4 mr-1" />
                        Revoke
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </ScrollArea>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Configure your security preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border bg-white dark:bg-zinc-900">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      Two-Factor Authentication
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={twoFactorEnabled}
                    onCheckedChange={setTwoFactorEnabled}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info("2FA setup guide")}
                  >
                    Setup
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border bg-white dark:bg-zinc-900">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Login Notifications</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Get notified when someone logs into your account
                    </p>
                  </div>
                </div>
                <Switch
                  checked={loginNotifications}
                  onCheckedChange={setLoginNotifications}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border bg-white dark:bg-zinc-900">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                    <Key className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">API Key Management</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Manage your API keys and access tokens
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.info("API Keys page")}
                >
                  Manage
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Audit Logs
              </CardTitle>
              <CardDescription>
                Recent security events and actions
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 lg:max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
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
                    <Activity className="h-4 w-4 mr-2" />
                    Sort by action
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleExportLogs}>
                    <Download className="h-4 w-4 mr-2" />
                    Export logs
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <ScrollArea className="h-[500px]">
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">
                          {log.action}
                        </TableCell>
                        <TableCell>{log.user}</TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {log.ip}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{log.location}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {log.device}
                          </span>
                        </TableCell>
                        <TableCell>
                          {log.status === "success" ? (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Success
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="gap-1">
                              <XCircle className="h-3 w-3" />
                              Failed
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{log.timestamp}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
}
