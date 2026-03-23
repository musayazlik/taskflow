"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  BarChart3,
  Mail,
  Bell,
  Shield,
  HelpCircle,
  Menu,
  X,
  Image,
  Brain,
  Key,
  MessageSquare,
  FileEdit,
  ImageIcon,
  Search,
} from "lucide-react";
import { Button } from "@repo/shadcn-ui/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@repo/shadcn-ui/ui/sheet";
import { ScrollArea } from "@repo/shadcn-ui/ui/scroll-area";
import { useState } from "react";
import { useSession } from "@/lib/auth-client";

interface MenuItem {
  icon: any;
  label: string;
  href: string;
  roles?: ("USER" | "ADMIN" | "SUPER_ADMIN")[];
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const menuItems: MenuSection[] = [
  {
    title: "Main",
    items: [
      {
        icon: LayoutDashboard,
        label: "Dashboard",
        href: "/panel",
        roles: ["USER", "ADMIN"],
      },
      {
        icon: BarChart3,
        label: "Analytics",
        href: "/panel/analytics",
        roles: ["ADMIN"],
      },
    ],
  },
  {
    title: "Management",
    items: [
      { icon: Users, label: "Users", href: "/panel/users", roles: ["ADMIN"] },
      {
        icon: FileText,
        label: "Content",
        href: "/panel/content",
        roles: ["ADMIN"],
      },
      { icon: Image, label: "Media", href: "/panel/media", roles: ["ADMIN"] },
    ],
  },
  {
    title: "Communication",
    items: [
      {
        icon: Mail,
        label: "Messages",
        href: "/panel/messages",
        roles: ["ADMIN"],
      },
      {
        icon: Bell,
        label: "Notifications",
        href: "/panel/notifications",
        roles: ["ADMIN"],
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        icon: Key,
        label: "Roles & Permissions",
        href: "/panel/rbac",
        roles: ["SUPER_ADMIN"],
      },
      {
        icon: Brain,
        label: "AI Models",
        href: "/panel/ai-models",
        roles: ["ADMIN"],
      },
      {
        icon: MessageSquare,
        label: "AI Chat",
        href: "/panel/ai-models/chat",
        roles: ["USER", "ADMIN"],
      },
      {
        icon: FileEdit,
        label: "AI Content",
        href: "/panel/ai-models/content",
        roles: ["USER", "ADMIN"],
      },
      {
        icon: ImageIcon,
        label: "AI Image",
        href: "/panel/ai-models/image",
        roles: ["USER", "ADMIN"],
      },
      {
        icon: Search,
        label: "AI SEO",
        href: "/panel/ai-models/seo",
        roles: ["USER", "ADMIN"],
      },
      {
        icon: Shield,
        label: "Security",
        href: "/panel/security",
        roles: ["ADMIN"],
      },
      {
        icon: Settings,
        label: "Settings",
        href: "/panel/settings",
        roles: ["USER", "ADMIN"],
      },
      {
        icon: HelpCircle,
        label: "Help",
        href: "/panel/help",
        roles: ["USER", "ADMIN"],
      },
    ],
  },
];

export function MobileSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const userRole =
    ((session?.user as { role?: string } | undefined)?.role as
      | "USER"
      | "ADMIN"
      | "SUPER_ADMIN") || "USER";

  // Filter sections and items based on role
  // SUPER_ADMIN has access to all items (including ADMIN items)
  const filteredMenuItems = menuItems
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          !item.roles ||
          item.roles.includes(userRole) ||
          (userRole === "SUPER_ADMIN" && item.roles.includes("ADMIN")),
      ),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          <Link
            href="/panel"
            className="flex items-center gap-2"
            onClick={() => setOpen(false)}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              T
            </div>
            <span className="font-semibold text-lg">TurboStack</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="px-3 py-4">
            {filteredMenuItems.map((section) => (
              <div key={section.title} className="mb-4">
                <h4 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </h4>
                <nav className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
