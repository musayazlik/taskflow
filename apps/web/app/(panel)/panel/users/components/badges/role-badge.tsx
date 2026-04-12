import { Badge } from "@repo/shadcn-ui/badge";
import { cn } from "@/lib/utils";
import { Shield, Crown, ShieldCheck } from "lucide-react";

export interface RoleBadgeProps {
  role: string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const defaultConfig = {
    icon: Shield,
    label: "User",
    className:
      "bg-gray-100 dark:bg-zinc-700/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-600",
  };

  const config: Record<
    string,
    { icon: typeof Crown; label: string; className: string }
  > = {
    SUPER_ADMIN: {
      icon: ShieldCheck,
      label: "Super Admin",
      className:
        "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/30",
    },
    ADMIN: {
      icon: Crown,
      label: "Admin",
      className:
        "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
    },
    USER: defaultConfig,
  };

  const roleConfig = config[role] ?? defaultConfig;
  const Icon = roleConfig.icon;

  return (
    <Badge variant="outline" className={cn("gap-1.5", roleConfig.className)}>
      <Icon className="h-3 w-3" />
      {roleConfig.label}
    </Badge>
  );
}
