"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/shadcn-ui/card";
import { ScrollArea } from "@repo/shadcn-ui/scroll-area";
import { cn } from "@/lib/utils";
import { Zap, Sparkles, ChevronRight } from "lucide-react";

interface FAQCategory {
  id: string;
  title: string;
  count: number;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface FAQCategoriesSidebarProps {
  faqCategories: FAQCategory[];
  faqs: Array<{ id: string | number; category: string }>;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export function FAQCategoriesSidebar({
  faqCategories,
  faqs,
  selectedCategory,
  onCategoryChange,
}: FAQCategoriesSidebarProps) {
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Browse by Category
        </CardTitle>
        <CardDescription>Find answers organized by topic</CardDescription>
      </CardHeader>
      <ScrollArea className="h-[400px]">
        <CardContent>
          <div className="space-y-2">
            <button
              onClick={() => onCategoryChange(null)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                selectedCategory === null
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700",
              )}
            >
              <div className="p-2 rounded-lg bg-gray-100 dark:bg-zinc-800">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">All Categories</p>
                <p className="text-xs text-muted-foreground">
                  {faqs.length} articles
                </p>
              </div>
            </button>
            {faqCategories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.title)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                    selectedCategory === category.title
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700",
                  )}
                >
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      selectedCategory === category.title
                        ? "bg-primary/20"
                        : "bg-gray-100 dark:bg-zinc-800",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        selectedCategory === category.title
                          ? "text-primary"
                          : category.color,
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{category.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {category.count} articles
                    </p>
                  </div>
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform",
                      selectedCategory === category.title && "translate-x-1",
                    )}
                  />
                </button>
              );
            })}
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
