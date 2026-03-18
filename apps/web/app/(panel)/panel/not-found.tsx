"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@repo/shadcn-ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/shadcn-ui/card";
import {
  ArrowLeft,
  FileQuestion,
  LayoutDashboard,
  User,
  Settings,
  HelpCircle,
  Sparkles,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PanelNotFound() {
  const router = useRouter();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/25">
              <FileQuestion className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Page Not Found
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                The page you&apos;re looking for doesn&apos;t exist.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 overflow-hidden">
        <CardContent className="pt-12 pb-12 px-6 md:px-12">
          <div className="max-w-2xl mx-auto text-center">
            {/* Icon */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-linear-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border-2 border-amber-200 dark:border-amber-800/50 shadow-lg">
                  <FileQuestion className="h-16 w-16 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="absolute -bottom-3 -right-3 flex h-16 w-16 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/25 border-4 border-white dark:border-zinc-900">
                  <span className="text-2xl font-bold">404</span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Oops! Page Not Found
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-400 mb-2">
                The panel page you&apos;re looking for doesn&apos;t exist or has
                been moved.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                It may have been deleted, moved, or the URL might be incorrect.
              </p>
            </div>

            {/* Primary Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
              <Button asChild size="lg" className="shadow-md">
                <Link href="/panel">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.back()}
                className="border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>

            {/* Quick Links */}
            <div className="pt-8 border-t border-gray-200 dark:border-zinc-800">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">
                Quick Links
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="flex flex-col h-auto py-3 gap-2 hover:bg-gray-50 dark:hover:bg-zinc-800"
                >
                  <Link href="/panel">
                    <LayoutDashboard className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Dashboard
                    </span>
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="flex flex-col h-auto py-3 gap-2 hover:bg-gray-50 dark:hover:bg-zinc-800"
                >
                  <Link href="/panel/profile">
                    <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Profile
                    </span>
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="flex flex-col h-auto py-3 gap-2 hover:bg-gray-50 dark:hover:bg-zinc-800"
                >
                  <Link href="/panel/settings">
                    <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Settings
                    </span>
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="flex flex-col h-auto py-3 gap-2 hover:bg-gray-50 dark:hover:bg-zinc-800"
                >
                  <Link href="/panel/support">
                    <HelpCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Support
                    </span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
