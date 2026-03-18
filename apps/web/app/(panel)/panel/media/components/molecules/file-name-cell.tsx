"use client";

import type { MediaFile } from "@/services";

interface FileNameCellProps {
  file: MediaFile;
}

export function FileNameCell({ file }: FileNameCellProps) {
  return (
    <div className="min-w-0">
      <p className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
        {file.name}
      </p>
      <p className="text-xs text-muted-foreground">
        {file.type || "Unknown type"}
      </p>
    </div>
  );
}
