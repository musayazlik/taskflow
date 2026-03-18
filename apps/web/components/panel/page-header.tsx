"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@repo/shadcn-ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface PageHeaderAction {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?:
    | "default"
    | "outline"
    | "destructive"
    | "secondary"
    | "ghost"
    | "link";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export interface PageHeaderBadge {
  icon?: React.ReactNode;
  label: string;
  className?: string;
}

export interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Page description (optional) */
  description?: string;
  /** Icon component from lucide-react */
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  /** Custom icon element (alternative to icon prop) */
  iconElement?: React.ReactNode;
  /** Icon background style - 'primary' (default), 'gradient', or custom className */
  iconBg?: "primary" | "gradient" | string;
  /** Action buttons to display on the right */
  actions?: React.ReactNode | PageHeaderAction[];
  /** Badge to display (e.g., stats, status) */
  badge?: PageHeaderBadge | React.ReactNode;
  /** Additional className for the container */
  className?: string;
  /** Title size - 'default' (2xl) or 'large' (2xl md:3xl) */
  titleSize?: "default" | "large";
  /** Show icon */
  showIcon?: boolean;
}

/**
 * Reusable Page Header Component
 *
 * Provides a consistent header layout across all panel pages with:
 * - Icon with gradient background
 * - Title and description
 * - Action buttons
 * - Optional badge/stats display
 *
 * @example
 * ```tsx
 * <PageHeader
 *   icon={Users}
 *   title="Users"
 *   description="Manage user accounts and permissions"
 *   actions={[
 *     {
 *       label: "Add User",
 *       icon: <Plus className="w-4 h-4" />,
 *       onClick: () => setIsOpen(true),
 *     },
 *   ]}
 *   badge={{
 *     icon: <Sparkles className="h-4 w-4" />,
 *     label: "123 total users",
 *   }}
 * />
 * ```
 */
export function PageHeader({
  title,
  description,
  icon: Icon,
  iconElement,
  iconBg = "primary",
  actions,
  badge,
  className,
  titleSize = "default",
  showIcon = true,
}: PageHeaderProps) {
  const getIconBgClass = () => {
    if (
      typeof iconBg === "string" &&
      iconBg !== "primary" &&
      iconBg !== "gradient"
    ) {
      return iconBg;
    }
    if (iconBg === "gradient") {
      return "bg-linear-to-br from-primary/20 to-primary/5 ring-1 ring-primary/10";
    }
    return "bg-linear-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/25";
  };

  const getTitleClass = () => {
    if (titleSize === "large") {
      return "text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white";
    }
    return "text-2xl font-bold text-gray-900 dark:text-white";
  };

  const renderIcon = () => {
    if (!showIcon) return null;

    if (iconElement) {
      return (
        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-xl",
            getIconBgClass(),
          )}
        >
          {iconElement}
        </div>
      );
    }

    if (Icon) {
      const isPrimaryGradient = iconBg === "primary";
      return (
        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-xl",
            getIconBgClass(),
          )}
        >
          <Icon className={cn("h-5 w-5", isPrimaryGradient && "text-white")} />
        </div>
      );
    }

    return null;
  };

  const renderActions = () => {
    if (!actions) return null;

    // If actions is a ReactNode, render it directly
    if (React.isValidElement(actions)) {
      return <div className="flex items-center gap-2">{actions}</div>;
    }

    // If actions is an array but not PageHeaderAction[] (i.e., ReactNode[])
    if (Array.isArray(actions) && !actions[0]?.label) {
      return (
        <div className="flex items-center gap-2">
          {actions as React.ReactNode}
        </div>
      );
    }

    // If actions is an array of PageHeaderAction objects
    if (Array.isArray(actions) && actions[0]?.label) {
      return (
        <div className="flex items-center gap-2">
          {actions.map((action, index) => {
            const buttonContent = (
              <>
                {action.loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {action.label || "Loading..."}
                  </>
                ) : (
                  <>
                    {action.icon && <span className="mr-2">{action.icon}</span>}
                    {action.label}
                  </>
                )}
              </>
            );

            if (action.href) {
              return (
                <Button
                  key={index}
                  asChild
                  variant={action.variant || "default"}
                  disabled={action.disabled}
                  className={action.className}
                >
                  <Link href={action.href}>{buttonContent}</Link>
                </Button>
              );
            }

            return (
              <Button
                key={index}
                variant={action.variant || "default"}
                onClick={action.onClick}
                disabled={action.disabled || action.loading}
                className={action.className}
              >
                {buttonContent}
              </Button>
            );
          })}
        </div>
      );
    }

    return null;
  };

  const renderBadge = () => {
    if (!badge) return null;

    // If badge is a ReactNode, render it directly
    if (React.isValidElement(badge)) {
      return badge;
    }

    // If badge is a PageHeaderBadge object
    if (badge && typeof badge === "object" && "label" in badge) {
      return (
        <div
          className={cn(
            "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700",
            badge.className,
          )}
        >
          {badge.icon && <span className="text-primary">{badge.icon}</span>}
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {badge.label}
          </span>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-center md:justify-between gap-4",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {renderIcon()}
        <div>
          <h1 className={getTitleClass()}>{title}</h1>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {renderBadge()}
        {renderActions()}
      </div>
    </div>
  );
}
