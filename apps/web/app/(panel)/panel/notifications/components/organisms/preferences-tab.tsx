"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/shadcn-ui/card";
import { Button } from "@repo/shadcn-ui/button";
import { Switch } from "@repo/shadcn-ui/switch";
import { Label } from "@repo/shadcn-ui/label";
import {
  Zap,
  Settings,
  BellOff,
  Clock,
  Mail,
  Smartphone,
  Bell,
  CreditCard,
  Users,
  Shield,
  Globe,
} from "lucide-react";

interface Preference {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  email: boolean;
  push: boolean;
  inApp: boolean;
}

interface PreferencesTabProps {
  preferences: Preference[];
  togglePreference: (prefId: string, type: "email" | "push" | "inApp") => void;
  setAllChannel: (type: "email" | "push" | "inApp", enabled: boolean) => void;
}

export function PreferencesTab({
  preferences,
  togglePreference,
  setAllChannel,
}: PreferencesTabProps) {
  const allEmailEnabled = useMemo(
    () => preferences.length > 0 && preferences.every((p) => p.email),
    [preferences],
  );
  const allPushEnabled = useMemo(
    () => preferences.length > 0 && preferences.every((p) => p.push),
    [preferences],
  );
  const allInAppEnabled = useMemo(
    () => preferences.length > 0 && preferences.every((p) => p.inApp),
    [preferences],
  );

  const [doNotDisturb, setDoNotDisturb] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Quick Settings
          </CardTitle>
          <CardDescription>
            Enable or disable all notification channels at once
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between p-4 rounded-xl border bg-gray-50 dark:bg-zinc-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Email</p>
                  <p className="text-xs text-muted-foreground">
                    Receive via email
                  </p>
                </div>
              </div>
              <Switch
                checked={allEmailEnabled}
                onCheckedChange={(checked) => setAllChannel("email", checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border bg-gray-50 dark:bg-zinc-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <Smartphone className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Push</p>
                  <p className="text-xs text-muted-foreground">
                    Mobile notifications
                  </p>
                </div>
              </div>
              <Switch
                checked={allPushEnabled}
                onCheckedChange={(checked) => setAllChannel("push", checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border bg-gray-50 dark:bg-zinc-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                  <Bell className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">In-App</p>
                  <p className="text-xs text-muted-foreground">
                    Show in dashboard
                  </p>
                </div>
              </div>
              <Switch
                checked={allInAppEnabled}
                onCheckedChange={(checked) => setAllChannel("inApp", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Customize notifications for each category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="hidden md:grid grid-cols-[1fr,100px,100px,100px] gap-4 px-4 py-2 text-sm font-medium text-muted-foreground">
              <div>Category</div>
              <div className="text-center">Email</div>
              <div className="text-center">Push</div>
              <div className="text-center">In-App</div>
            </div>

            {preferences.map((pref) => {
              const Icon = pref.icon;
              return (
                <div
                  key={pref.id}
                  className="grid grid-cols-1 md:grid-cols-[1fr,100px,100px,100px] gap-4 p-4 rounded-xl border bg-white dark:bg-zinc-900 hover:border-gray-300 dark:hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-zinc-800">
                      <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{pref.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {pref.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-center">
                    <Label className="md:hidden text-sm text-muted-foreground">
                      Email
                    </Label>
                    <Switch
                      checked={pref.email}
                      onCheckedChange={() =>
                        togglePreference(pref.id, "email")
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between md:justify-center">
                    <Label className="md:hidden text-sm text-muted-foreground">
                      Push
                    </Label>
                    <Switch
                      checked={pref.push}
                      onCheckedChange={() => togglePreference(pref.id, "push")}
                    />
                  </div>

                  <div className="flex items-center justify-between md:justify-center">
                    <Label className="md:hidden text-sm text-muted-foreground">
                      In-App
                    </Label>
                    <Switch
                      checked={pref.inApp}
                      onCheckedChange={() =>
                        togglePreference(pref.id, "inApp")
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5 text-primary" />
            Do Not Disturb
          </CardTitle>
          <CardDescription>
            Temporarily pause all notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-xl border bg-gray-50 dark:bg-zinc-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <BellOff className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="font-medium text-sm">Enable Do Not Disturb</p>
                <p className="text-xs text-muted-foreground">
                  Mute all notifications until you turn this off
                </p>
              </div>
            </div>
            <Switch checked={doNotDisturb} onCheckedChange={setDoNotDisturb} />
          </div>

          <div className="mt-4 p-4 rounded-xl border border-dashed">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Schedule Quiet Hours</p>
                <p className="text-xs text-muted-foreground">
                  Automatically enable DND during specific times
                </p>
              </div>
              <Button variant="outline" size="sm">
                <Clock className="h-4 w-4 mr-2" />
                Set Schedule
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
