/**
 * Media Upload Helper
 * 
 * UploadThing React components artık media servisi kullanıyor
 * Bu dosya geriye dönük uyumluluk için tutuluyor
 * Yeni kodlar için mediaService.uploadFiles kullanılmalı
 */

import { mediaService } from "@/services";

/**
 * Upload files using media service
 * Replaces UploadThing React components with media service
 */
export async function uploadFiles(files: File[]): Promise<{
  success: boolean;
  data?: Array<{
    key: string;
    name: string;
    size: number;
    url: string;
    type: string;
  }>;
  error?: string;
}> {
  const result = await mediaService.uploadFiles(files);
  
  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  return {
    success: true,
    data: result.data?.map((file) => ({
      key: file.key,
      name: file.name,
      size: file.size,
      url: file.url,
      type: file.type || "image/unknown",
    })),
  };
}

// UploadThing React components artık kullanılmıyor
// Media servisi kullanılmalı
export const UploadButton = null as any;
export const UploadDropzone = null as any;
export const useUploadThing = null as any;
