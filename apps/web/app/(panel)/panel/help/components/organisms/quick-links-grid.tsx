"use client";

import { Card, CardContent } from "@repo/shadcn-ui/card";
import { Button } from "@repo/shadcn-ui/button";
import { ChevronRight } from "lucide-react";

interface QuickLink {
  title: string;
  description: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface QuickLinksGridProps {
  quickLinks: QuickLink[];
}

export function QuickLinksGrid({ quickLinks }: QuickLinksGridProps) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {quickLinks.map((link) => {
        const Icon = link.icon;
        return (
          <Card
            key={link.title}
            className="group hover:border-primary transition-all cursor-pointer hover:shadow-lg"
          >
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">{link.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {link.description}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full group-hover:text-primary"
                >
                  Visit
                  <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
