import { Badge } from "@repo/shadcn-ui/badge";
import { UserCheck, UserX } from "lucide-react";

export interface StatusBadgeProps {
  verified: boolean;
  verifiedAt?: string | null;
}

export function StatusBadge({ verified, verifiedAt }: StatusBadgeProps) {
  if (verified) {
    return (
      <div className="flex flex-col gap-0.5">
        <Badge
          variant="outline"
          className="gap-1.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
        >
          <UserCheck className="h-3 w-3" />
          Verified
        </Badge>
        {verifiedAt && (
          <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-1">
            {new Date(verifiedAt).toLocaleDateString()}
          </span>
        )}
      </div>
    );
  }

  return (
    <Badge
      variant="outline"
      className="gap-1.5 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30"
    >
      <UserX className="h-3 w-3" />
      Pending
    </Badge>
  );
}
