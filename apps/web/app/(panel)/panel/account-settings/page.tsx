"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/shadcn-ui/card";
import { Button } from "@repo/shadcn-ui/button";
import { Input } from "@repo/shadcn-ui/input";
import { Label } from "@repo/shadcn-ui/label";
import { Switch } from "@repo/shadcn-ui/switch";
import {
  Settings,
  Bell,
  Shield,
  Key,
  Smartphone,
  Mail,
  Save,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PageHeader } from "@/components/panel/page-header";

export default function AccountSettingsPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const user = session?.user as
    | {
        id?: string;
        email?: string;
        name?: string | null;
        emailVerified?: boolean;
      }
    | undefined;

  // Notification preferences
  const [notifications, setNotifications] = useState({
    email: {
      marketing: true,
      updates: true,
      security: true,
      newsletter: false,
    },
    push: {
      newFeatures: true,
      security: true,
      mentions: false,
    },
  });

  // Security settings
  const [security, setSecurity] = useState({
    twoFactor: false,
    loginAlerts: true,
    sessionTimeout: "30",
  });

  const handleSaveNotifications = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Notification preferences saved");
    setIsLoading(false);
  };

  const handleSaveSecurity = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Security settings saved");
    setIsLoading(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success("Password changed successfully");
    setIsChangingPassword(false);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        icon={Settings}
        title="Account Settings"
        description="Manage your notifications, security, and preferences"
        titleSize="large"
      />

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Notification Preferences */}
        <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-500" />
              Notification Preferences
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Choose how you want to be notified
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Notifications */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                Email Notifications
              </h4>
              <div className="space-y-3">
                {[
                  {
                    key: "marketing",
                    label: "Marketing emails",
                    description: "Receive offers and promotions",
                  },
                  {
                    key: "updates",
                    label: "Product updates",
                    description: "New features and improvements",
                  },
                  {
                    key: "security",
                    label: "Security alerts",
                    description: "Important security notifications",
                  },
                  {
                    key: "newsletter",
                    label: "Newsletter",
                    description: "Weekly digest and tips",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.description}
                      </p>
                    </div>
                    <Switch
                      checked={
                        notifications.email[
                          item.key as keyof typeof notifications.email
                        ]
                      }
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({
                          ...prev,
                          email: { ...prev.email, [item.key]: checked },
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-zinc-800" />

            {/* Push Notifications */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-gray-400" />
                Push Notifications
              </h4>
              <div className="space-y-3">
                {[
                  {
                    key: "newFeatures",
                    label: "New features",
                    description: "When new features are released",
                  },
                  {
                    key: "security",
                    label: "Security alerts",
                    description: "Login from new devices",
                  },
                  {
                    key: "mentions",
                    label: "Mentions",
                    description: "When someone mentions you",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.description}
                      </p>
                    </div>
                    <Switch
                      checked={
                        notifications.push[
                          item.key as keyof typeof notifications.push
                        ]
                      }
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({
                          ...prev,
                          push: { ...prev.push, [item.key]: checked },
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSaveNotifications}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Preferences
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <div className="space-y-6">
          <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-500" />
                Security Settings
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Protect your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Two Factor Authentication */}
              <div className="flex items-start justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Two-Factor Authentication
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Add an extra layer of security
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {security.twoFactor ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                      <CheckCircle className="h-3 w-3" />
                      Enabled
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Disabled</span>
                  )}
                  <Switch
                    checked={security.twoFactor}
                    onCheckedChange={(checked) =>
                      setSecurity((prev) => ({ ...prev, twoFactor: checked }))
                    }
                  />
                </div>
              </div>

              {/* Login Alerts */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Login Alerts
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Get notified of new logins
                  </p>
                </div>
                <Switch
                  checked={security.loginAlerts}
                  onCheckedChange={(checked) =>
                    setSecurity((prev) => ({ ...prev, loginAlerts: checked }))
                  }
                />
              </div>

              {/* Session Timeout */}
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">
                  Session Timeout (minutes)
                </Label>
                <select
                  value={security.sessionTimeout}
                  onChange={(e) =>
                    setSecurity((prev) => ({
                      ...prev,
                      sessionTimeout: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-md bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                </select>
              </div>

              <Button
                onClick={handleSaveSecurity}
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Security Settings
              </Button>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <Key className="h-5 w-5 text-violet-500" />
                Change Password
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Update your password regularly for security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="currentPassword"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Current Password
                  </Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Enter current password"
                    className="bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="newPassword"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    className="bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    className="bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
                    required
                  />
                </div>

                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      Password must be at least 8 characters long and contain at
                      least one uppercase letter, one lowercase letter, and one
                      number.
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                >
                  {isChangingPassword ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Key className="h-4 w-4 mr-2" />
                  )}
                  Change Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Email Verification Banner */}
      {!user?.emailVerified && (
        <Card className="bg-linear-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-500/20">
                  <Mail className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Verify your email address
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Please verify your email to access all features. Check your
                    inbox for the verification link.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30"
              >
                Resend Email
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
