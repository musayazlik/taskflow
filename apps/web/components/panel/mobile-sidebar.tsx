"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { Button } from "@repo/shadcn-ui/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@repo/shadcn-ui/ui/sheet";
import { ScrollArea } from "@repo/shadcn-ui/ui/scroll-area";
import { useSession } from "@/lib/auth-client";
import {
  menuItems,
  filterMenuByRole,
  type UserRole,
  type MenuItem,
} from "@/lib/menu-items";

function isRouteActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === "/panel") return false;
  return pathname.startsWith(`${href}/`);
}

function renderMenuItem(
  item: MenuItem,
  pathname: string,
  onNavigate: () => void,
) {
  if (item.subItems?.length) {
    return (
      <div key={item.label} className="space-y-1">
        <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {item.label}
        </p>
        {item.subItems.map((sub) => {
          const SubIcon = sub.icon;
          const active = isRouteActive(pathname, sub.href);
          return (
            <Link
              key={sub.href}
              href={sub.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <SubIcon className="h-4 w-4 shrink-0" />
              <span>{sub.label}</span>
            </Link>
          );
        })}
      </div>
    );
  }

  if (!item.href) return null;

  const Icon = item.icon;
  const active = isRouteActive(pathname, item.href);

  return (
    <Link
      key={item.href}
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{item.label}</span>
    </Link>
  );
}

export function MobileSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const userRole: UserRole =
    (session?.user as { role?: UserRole } | undefined)?.role ?? "USER";

  const filteredMenuItems = useMemo(
    () => filterMenuByRole(menuItems, userRole),
    [userRole],
  );

  const close = () => setOpen(false);

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
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          <Link
            href="/panel"
            className="flex items-center gap-2"
            onClick={close}
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

        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="px-3 py-4">
            {filteredMenuItems.map((section) => (
              <div key={section.title} className="mb-4">
                <h4 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </h4>
                <nav className="space-y-1">
                  {section.items.map((item) => renderMenuItem(item, pathname, close))}
                </nav>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
