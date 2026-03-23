import {
  APP_NAME,
  APP_VERSION,
  VERSION_STATUS,
  getVersionDisplay,
  getVersionBadgeColor,
} from "@/lib/version";
import { Badge } from "@repo/shadcn-ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/shadcn-ui/card";
import { Button } from "@repo/shadcn-ui/button";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Sparkles,
  AlertCircle,
  Zap,
  Bug,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Changelog data
const changelogEntries = [
  {
    version: "0.1.0",
    status: "dev" as const,
    date: "2026-01-21",
    changes: {
      added: [
        "AI Models management system with OpenRouter integration",
        "AI Chat, SEO Generator, Image Generator, and Content Writer features",
        "Media library with UploadThing integration",
        "Modern notifications system with preferences",
        "Enhanced security dashboard with audit logs",
        "Comprehensive help & support center",
      ],
      improved: [
        "Redesigned all panel pages with modern UI",
        "Improved sidebar navigation with sub-menus",
        "Enhanced image display with zoom functionality",
        "Better responsive design across all pages",
      ],
      fixed: [
        "Fixed scroll issues in chat and image generation pages",
        "Resolved hydration errors in multi-select component",
        "Fixed infinite re-render loops in Zustand stores",
      ],
    },
  },
  {
    version: "0.0.9",
    status: "dev" as const,
    date: "2026-01-15",
    changes: {
      added: ["User management system", "Product catalog", "Order management"],
      improved: ["Authentication flow", "Dashboard analytics"],
      fixed: ["Various UI bugs"],
    },
  },
  {
    version: "0.0.8",
    status: "alpha" as const,
    date: "2026-01-10",
    changes: {
      added: ["Initial release", "Basic authentication", "Dashboard layout"],
      improved: [],
      fixed: [],
    },
  },
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/30 pt-40">
      {/* Hero Section */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Badge
              variant="secondary"
              className={cn(
                "font-mono text-sm font-semibold px-3 py-1",
                getVersionBadgeColor(),
              )}
            >
              v{getVersionDisplay()}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {VERSION_STATUS.toUpperCase()}
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Changelog
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay up to date with the latest features, improvements, and fixes in{" "}
            {APP_NAME}.
          </p>
        </div>

        {/* Changelog Entries */}
        <div className="max-w-4xl mx-auto space-y-8">
          {changelogEntries.map((entry, index) => (
            <Card key={entry.version} className="relative overflow-hidden">
              {/* Version Badge */}
              <div className="absolute top-4 right-4">
                <Badge
                  variant="secondary"
                  className={cn(
                    "font-mono text-xs font-semibold",
                    entry.status === "dev"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : entry.status === "alpha"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                  )}
                >
                  v{entry.version}
                  {entry.status !== "dev" && `-${entry.status}`}
                </Badge>
              </div>

              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {entry.date}
                  </span>
                </div>
                <CardTitle className="text-2xl">
                  Version {entry.version}
                </CardTitle>
                <CardDescription>
                  {entry.status === "dev"
                    ? "Development release - may contain bugs"
                    : entry.status === "alpha"
                      ? "Alpha release - testing phase"
                      : "Stable release"}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Added */}
                {entry.changes.added.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                        <Plus className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h3 className="font-semibold text-emerald-700 dark:text-emerald-400">
                        Added
                      </h3>
                    </div>
                    <ul className="space-y-2 ml-8">
                      {entry.changes.added.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm"
                        >
                          <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improved */}
                {entry.changes.improved.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="font-semibold text-blue-700 dark:text-blue-400">
                        Improved
                      </h3>
                    </div>
                    <ul className="space-y-2 ml-8">
                      {entry.changes.improved.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm"
                        >
                          <Zap className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Fixed */}
                {entry.changes.fixed.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                        <Bug className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <h3 className="font-semibold text-amber-700 dark:text-amber-400">
                        Fixed
                      </h3>
                    </div>
                    <ul className="space-y-2 ml-8">
                      {entry.changes.fixed.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm"
                        >
                          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="max-w-4xl mx-auto mt-12">
          <Card className="bg-linear-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">
                  Want to stay updated?
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Follow our GitHub repository to get notified about new
                  releases and updates.
                </p>
                <Button asChild>
                  <a
                    href="https://github.com/taskflow"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on GitHub
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
