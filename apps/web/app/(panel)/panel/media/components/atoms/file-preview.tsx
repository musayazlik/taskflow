"use client";

import Image from "next/image";
import { File } from "lucide-react";
import { ImageZoom } from "@repo/shadcn-ui/image-zoom";
import { isImageFile } from "../utils";
import type { MediaFile } from "@/services";

interface FilePreviewProps {
  file: MediaFile;
}

export function FilePreview({ file }: FilePreviewProps) {
  const isImage = isImageFile(file);

  return (
    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted ring-1 ring-gray-200 dark:ring-zinc-700 flex-shrink-0">
      {isImage ? (
        <ImageZoom>
          <Image
            src={file.url}
            alt={file.name}
            width={48}
            height={48}
            className="object-cover w-full h-full min-h-12 cursor-zoom-in"
            unoptimized
          />
        </ImageZoom>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <File className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
