"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  Loader2,
  Settings,
} from "lucide-react";
import Image from "next/image";
import { ScrollArea } from "@repo/shadcn-ui/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/shadcn-ui/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/shadcn-ui/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/shadcn-ui/ui/avatar";
import { Skeleton } from "@repo/shadcn-ui/ui/skeleton";

import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  menuItems,
  filterMenuByRole,
  getInitialOpenSubmenus,
  type MenuItem,
  type UserRole,
} from "@/lib/menu-items";

const SIDEBAR_BRAND = {
  name: "Taskflow",
  subtitle: "Admin Panel",
} as const;

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

/**
 * Sidebar Skeleton component
 * Used during loading and initial hydration to prevent layout shift
 */
export function SidebarSkeleton({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen flex flex-col transition-all duration-300 ease-in-out",
        "bg-white dark:bg-zinc-950",
        "border-r border-zinc-200 dark:border-zinc-800",
        isCollapsed ? "w-[72px]" : "w-64",
      )}
    >
      {/* Logo Section Skeleton */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-zinc-200 dark:border-zinc-800",
          isCollapsed ? "justify-center px-2" : "justify-between px-4",
        )}
      >
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-xl bg-zinc-200 dark:bg-zinc-800/60" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800/60" />
                <Skeleton className="h-3 w-16 bg-zinc-200 dark:bg-zinc-800/60" />
              </div>
            </div>
            <Skeleton className="h-8 w-8 rounded-lg bg-zinc-200 dark:bg-zinc-800/60" />
          </>
        ) : (
          <Skeleton className="h-8 w-8 rounded-lg bg-zinc-200 dark:bg-zinc-800/60" />
        )}
      </div>

      {/* Navigation Skeleton */}
      <div className="flex-1 overflow-hidden">
        <div className={cn("py-4", isCollapsed ? "px-2" : "px-3")}>
          {[1, 2, 3].map((section) => (
            <div key={section} className={cn(section > 1 && "mt-6")}>
              {!isCollapsed && (
                <div className="px-3 mb-2">
                  <Skeleton className="h-3 w-20 bg-zinc-200 dark:bg-zinc-800/40" />
                </div>
              )}
              {isCollapsed && section > 1 && (
                <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-3 mx-2" />
              )}
              <nav className="space-y-1">
                {[1, 2, 3].map((item) => (
                  <Skeleton
                    key={item}
                    className={cn(
                      "rounded-xl bg-zinc-200 dark:bg-zinc-800/60",
                      isCollapsed ? "h-12 w-12 mx-auto" : "h-10 w-full",
                    )}
                  />
                ))}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* User Section Skeleton */}
      <div
        className={cn(
          "border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950",
          isCollapsed ? "p-2" : "p-3",
        )}
      >
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800/60" />
            <Skeleton className="h-10 w-10 rounded-lg bg-zinc-200 dark:bg-zinc-800/60" />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 px-2 py-2">
              <Skeleton className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800/60" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800/60" />
                <Skeleton className="h-3 w-32 bg-zinc-200 dark:bg-zinc-800/60" />
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Skeleton className="flex-1 h-9 rounded-lg bg-zinc-200 dark:bg-zinc-800/60" />
              <Skeleton className="h-9 w-20 rounded-lg bg-zinc-200 dark:bg-zinc-800/60" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userRole: UserRole =
    (session?.user as { role?: UserRole } | undefined)?.role ?? "USER";

  const user = session?.user as
    | {
        id?: string;
        email?: string;
        name?: string | null;
        role?: string;
        image?: string | null;
      }
    | undefined;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "U";

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Successfully logged out");
            router.push("/");
            router.refresh();
          },
          onError: (error) => {
            console.error("Logout error:", error);
            toast.error("Failed to log out");
            setIsLoggingOut(false);
          },
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
      setIsLoggingOut(false);
    }
  };

  const [openSubmenus, setOpenSubmenus] = useState<string[]>(() =>
    getInitialOpenSubmenus(menuItems, pathname),
  );
  const toggleSubmenu = (label: string) => {
    setOpenSubmenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  };

  const filteredMenuItems = useMemo(
    () => filterMenuByRole(menuItems, userRole),
    [userRole],
  );

  // Loading skeleton - used on server and first client render to prevent hydration mismatch
  if (!mounted || isPending) {
    return <SidebarSkeleton isCollapsed={isCollapsed} />;
  }


  const renderMenuItem = (item: MenuItem) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isActive = item.href ? pathname === item.href : false;
    const isSubActive =
      hasSubItems &&
      item.subItems!.some((sub) => pathname.startsWith(sub.href));
    const isOpen = openSubmenus.includes(item.label);
    const Icon = item.icon;

    // Item with subitems
    if (hasSubItems) {
      if (isCollapsed) {
        // Collapsed view - show tooltip with subitems
        return (
          <Tooltip key={item.label}>
            <TooltipTrigger asChild>
              <button
                onClick={() => toggleSubmenu(item.label)}
                className={cn(
                  "group relative flex items-center justify-center rounded-xl w-12 h-12 mx-auto text-sm font-medium transition-all duration-200",
                  isSubActive
                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white",
                )}
              >
                <div className="flex items-center justify-center w-6 h-6">
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-transform duration-200",
                      !isSubActive && "group-hover:scale-110",
                    )}
                  />
                </div>
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="p-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-xl rounded-xl overflow-hidden"
              sideOffset={12}
            >
              <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      className={cn(
                        "flex items-center justify-center min-w-[18px] h-4 px-1 rounded text-[9px] font-semibold",
                        item.badge === "New"
                          ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400"
                          : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300",
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </div>
              <div className="py-1">
                {item.subItems!.map((subItem) => {
                  const SubIcon = subItem.icon;
                  const isSubItemActive = pathname === subItem.href;
                  return (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 text-sm transition-colors",
                        isSubItemActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800",
                      )}
                    >
                      <SubIcon className="h-4 w-4" />
                      {subItem.label}
                    </Link>
                  );
                })}
              </div>
            </TooltipContent>
          </Tooltip>
        );
      }

      // Expanded view with collapsible submenu
      return (
        <Collapsible
          key={item.label}
          open={isOpen}
          onOpenChange={() => toggleSubmenu(item.label)}
        >
          <CollapsibleTrigger asChild>
            <button
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 w-full text-sm font-medium transition-all duration-200",
                isSubActive
                  ? "bg-primary/10 dark:bg-primary/20 text-primary"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white",
              )}
            >
              {/* Active Indicator */}
              {isSubActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
              )}

              {/* Icon */}
              <div className="flex items-center justify-center w-5 h-5 shrink-0">
                <Icon
                  className={cn(
                    "h-[18px] w-[18px] transition-transform duration-200",
                    !isSubActive && "group-hover:scale-110",
                  )}
                />
              </div>

              {/* Label & Badge */}
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span
                  className={cn(
                    "flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-md text-[10px] font-semibold",
                    item.badge === "New"
                      ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400"
                      : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300",
                  )}
                >
                  {item.badge}
                </span>
              )}

              {/* Chevron */}
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-zinc-400 transition-transform duration-200",
                  isOpen && "rotate-180",
                )}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
            <div className="ml-4 pl-4 border-l-2 border-zinc-200 dark:border-zinc-700 mt-1 space-y-0.5">
              {item.subItems!.map((subItem) => {
                const SubIcon = subItem.icon;
                const isSubItemActive = pathname === subItem.href;
                return (
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                      isSubItemActive
                        ? "bg-primary text-white shadow-md shadow-primary/25"
                        : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white",
                    )}
                  >
                    <SubIcon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform duration-200",
                        !isSubItemActive && "group-hover:scale-110",
                      )}
                    />
                    <span>{subItem.label}</span>
                  </Link>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      );
    }

    // Regular item without subitems
    if (!item.href) return null;
    const linkContent = (
      <Link
        href={item.href}
        className={cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-primary text-white shadow-lg shadow-primary/25"
            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white",
          isCollapsed && "justify-center px-0 w-12 h-12 mx-auto",
        )}
      >
        {/* Active Indicator */}
        {isActive && !isCollapsed && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
        )}

        {/* Icon */}
        <div
          className={cn(
            "flex items-center justify-center shrink-0",
            isCollapsed ? "w-6 h-6" : "w-5 h-5",
          )}
        >
          <Icon
            className={cn(
              "transition-transform duration-200",
              isCollapsed ? "h-5 w-5" : "h-[18px] w-[18px]",
              !isActive && "group-hover:scale-110",
            )}
          />
        </div>

        {/* Label & Badge */}
        {!isCollapsed && (
          <>
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span
                className={cn(
                  "flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-md text-[10px] font-semibold",
                  isActive
                    ? "bg-white/20 text-white"
                    : item.badge === "New"
                      ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400"
                      : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300",
                )}
              >
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    );

    if (isCollapsed) {
      return (
        <Tooltip key={item.href}>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent
            side="right"
            className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-800 text-white border-0 shadow-xl"
            sideOffset={12}
          >
            <span>{item.label}</span>
            {item.badge && (
              <span
                className={cn(
                  "flex items-center justify-center min-w-[18px] h-4 px-1 rounded text-[9px] font-semibold",
                  item.badge === "New"
                    ? "bg-emerald-500 text-white"
                    : "bg-white/20 text-white",
                )}
              >
                {item.badge}
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      );
    }

    return <div key={item.href}>{linkContent}</div>;
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen flex flex-col transition-all duration-300 ease-in-out",
          "bg-white dark:bg-zinc-950",
          "border-r border-zinc-200 dark:border-zinc-800",
          isCollapsed ? "w-[72px]" : "w-64",
        )}
      >
        {/* Logo Section */}
        <div
          className={cn(
            "flex h-16 items-center border-b border-zinc-200 dark:border-zinc-800",
            isCollapsed ? "justify-center px-2" : "justify-between px-4",
          )}
        >
          {!isCollapsed && (
            <Link
              href="/panel"
              className="flex items-center gap-3 group transition-opacity duration-200"
            >
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/80 text-white font-bold shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
                <Image
                  src={"/logo.svg"}
                  alt="Taskflow Logo"
                  width={36}
                  height={36}
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base text-zinc-900 dark:text-white">
                  {SIDEBAR_BRAND.name}
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                  {SIDEBAR_BRAND.subtitle}
                </span>
              </div>
            </Link>
          )}
          <button
            onClick={onToggle}
            className={cn(
              "flex items-center justify-center h-8 w-8 rounded-lg shrink-0",
              "bg-zinc-100 dark:bg-zinc-800",
              "hover:bg-zinc-200 dark:hover:bg-zinc-700",
              "border border-zinc-200 dark:border-zinc-700",
              "transition-all duration-200",
              "text-zinc-500 dark:text-zinc-400",
              isCollapsed && "mx-auto",
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className={cn("py-4", isCollapsed ? "px-2" : "px-3")}>
              {filteredMenuItems.map((section, sectionIndex) => (
                <div
                  key={section.title}
                  className={cn(sectionIndex > 0 && "mt-6")}
                >
                  {/* Section Title */}
                  {!isCollapsed && (
                    <div className="flex items-center gap-2 px-3 mb-2">
                      <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        {section.title}
                      </span>
                      <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
                    </div>
                  )}
                  {isCollapsed && sectionIndex > 0 && (
                    <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-3 mx-2" />
                  )}

                  {/* Menu Items */}
                  <nav className="space-y-1">
                    {section.items.map((item) => renderMenuItem(item))}
                  </nav>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* User Section */}
        {user && (
          <div
            className={cn(
              "border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950",
              isCollapsed ? "p-2" : "p-3",
            )}
          >
            {isCollapsed ? (
              <div className="flex flex-col items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <Avatar className="h-10 w-10 ring-2 ring-zinc-200 dark:ring-zinc-700 shadow-sm cursor-pointer">
                        {user.image && (
                          <AvatarImage
                            src={user.image}
                            alt={user.name || user.email || "User"}
                          />
                        )}
                        <AvatarFallback className="bg-linear-to-br from-violet-500 to-purple-600 text-white text-sm font-medium">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="bg-zinc-950 dark:bg-zinc-800 text-white border-0 shadow-xl"
                    sideOffset={12}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold">
                        {user.name || "User"}
                      </span>
                      <span className="text-xs text-zinc-300">
                        {user.email}
                      </span>
                    </div>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200",
                        "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                      )}
                    >
                      {isLoggingOut ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <LogOut className="h-5 w-5" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="bg-zinc-950 dark:bg-zinc-800 text-white border-0 shadow-xl"
                    sideOffset={12}
                  >
                    Log Out
                  </TooltipContent>
                </Tooltip>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {/* User Info */}
                <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <div className="relative">
                    <Avatar className="h-10 w-10 ring-2 ring-zinc-200 dark:ring-zinc-700 shadow-sm">
                      {user.image && (
                        <AvatarImage
                          src={user.image}
                          alt={user.name || user.email || "User"}
                        />
                      )}
                      <AvatarFallback className="bg-linear-to-br from-violet-500 to-purple-600 text-white text-sm font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                      {user.name || "User"}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Link
                    href="/panel/settings"
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      pathname === "/panel/settings"
                        ? "bg-primary text-white shadow-md shadow-primary/25"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white",
                    )}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className={cn(
                      "flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                    )}
                  >
                    {isLoggingOut ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="h-4 w-4" />
                    )}
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}
