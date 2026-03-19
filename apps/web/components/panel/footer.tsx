"use client";

import Link from "next/link";
import {
  APP_NAME,
  getVersionDisplay,
  getVersionBadgeColor,
} from "@/lib/version";
import { TASKFLOW_GITHUB_URL } from "@/constant/landing";
import { Badge } from "@repo/shadcn-ui/badge";
import { Github, Heart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function PanelFooter() {
  return (
    <footer className="w-full border-t border-border bg-linear-to-b from-background to-background/95 backdrop-blur-sm mt-auto">
      <div className="w-full px-4 md:px-6 lg:px-8 py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
          {/* Left: Copyright */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </p>
          </div>

          {/* Center: Version Info */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <Link href="/changelog">
              <Badge
                variant="secondary"
                className={cn(
                  "font-mono text-xs font-semibold px-3 py-1.5 cursor-pointer hover:scale-105 transition-transform",
                  getVersionBadgeColor(),
                  "group",
                )}
              >
                <Sparkles className="h-3 w-3 mr-1.5 inline group-hover:rotate-180 transition-transform duration-500" />
                v{getVersionDisplay()}
              </Badge>
            </Link>
          </div>

          {/* Right: Links */}
          <div className="flex items-center gap-3">
            <a
              href={TASKFLOW_GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-all p-2 rounded-lg hover:bg-muted hover:scale-110"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
