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
import { Input } from "@repo/shadcn-ui/input";
import { Label } from "@repo/shadcn-ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/shadcn-ui/ui/avatar";
import { Badge } from "@repo/shadcn-ui/badge";
import {
  User,
  Mail,
  Camera,
  Sparkles,
  Save,
  Loader2,
  ShoppingCart,
  HelpCircle,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/panel/page-header";
import { StatsGrid, type StatItem } from "@/components/stats";

interface UserData {
  id?: string;
  email?: string;
  name?: string | null;
  image?: string | null;
  role?: string;
  emailVerified?: boolean;
  createdAt?: Date;
}

interface ProfilePageClientProps {
  user: UserData;
}

export function ProfilePageClient({ user }: ProfilePageClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : (user?.email?.[0] || "U").toUpperCase();

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Profile updated successfully");
    setIsLoading(false);
  };

  const handleAvatarUpload = async () => {
    setIsUploading(true);
    // Simulate upload
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success("Avatar updated successfully");
    setIsUploading(false);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        icon={User}
        title="My Profile"
        description="Manage your personal information and avatar"
        titleSize="large"
      />

      {/* Account Stats */}
      <StatsGrid
        items={
          [
            {
              label: "Total Orders",
              value: 12,
              icon: ShoppingCart,
              color: "gray",
              trend: "+12%",
            },
            {
              label: "Support Tickets",
              value: 3,
              icon: HelpCircle,
              color: "gray",
              trend: "+5%",
            },
            {
              label: "Member Days",
              value: 45,
              icon: Calendar,
              color: "gray",
              trend: "+100%",
            },
          ] satisfies StatItem[]
        }
        columns={{ default: 1, sm: 2, lg: 3 }}
      />

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Avatar Card */}
        <Card className="lg:col-span-1 bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-950/30 dark:to-gray-950/30 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Camera className="h-5 w-5 text-blue-500" />
              Profile Picture
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Update your avatar
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative">
              <Avatar className="h-32 w-32 ring-4 ring-white dark:ring-zinc-800 shadow-xl">
                <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                <AvatarFallback className="text-3xl bg-linear-to-br from-blue-500 to-indigo-500 text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={handleAvatarUpload}
                disabled={isUploading}
                className="absolute bottom-0 right-0 flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 shadow-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
              >
                {isUploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Camera className="h-5 w-5" />
                )}
              </button>
            </div>
            <div className="mt-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {user?.name || "User"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
              <div className="mt-3 flex justify-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30"
                >
                  {user?.role || "USER"}
                </Badge>
                {user?.emailVerified ? (
                  <Badge
                    variant="outline"
                    className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
                  >
                    Verified
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30"
                  >
                    Unverified
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Info Card */}
        <Card className="lg:col-span-2 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              Personal Information
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Update your personal details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    defaultValue={user?.name || ""}
                    placeholder="Enter your name"
                    className="pl-10 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    defaultValue={user?.email || ""}
                    disabled
                    className="pl-10 bg-gray-100 dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-gray-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-gray-700 dark:text-gray-300">
                Bio
              </Label>
              <textarea
                id="bio"
                rows={4}
                placeholder="Tell us a little about yourself..."
                className="w-full px-3 py-2 rounded-md bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Member Since
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("tr-TR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "N/A"}
                  </p>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
