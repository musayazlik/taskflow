"use client";

import { formatFileSize } from "../utils";
import type { MediaFile } from "@/services";

interface FileSizeCellProps {
  file: MediaFile;
}

export function FileSizeCell({ file }: FileSizeCellProps) {
  return (
    <span className="text-sm font-medium">{formatFileSize(file.size)}</span>
  );
}
