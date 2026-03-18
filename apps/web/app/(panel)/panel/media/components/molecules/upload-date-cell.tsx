"use client";

import { Calendar } from "lucide-react";
import { formatDate } from "../utils";
import type { MediaFile } from "@/services";

interface UploadDateCellProps {
  file: MediaFile;
}

export function UploadDateCell({ file }: UploadDateCellProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Calendar className="h-3.5 w-3.5" />
      {formatDate(file.uploadedAt)}
    </div>
  );
}
