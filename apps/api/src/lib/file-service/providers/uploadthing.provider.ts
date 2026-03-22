/**
 * @fileoverview `FileService` implementation backed by UploadThing `UTApi`.
 * Uses the shared `utapi` singleton from `@api/lib/uploadthing` so token handling and logging stay in one place.
 * @module @api/lib/file-service/providers/uploadthing.provider
 */

import { env } from "@api/lib/env";
import { logger } from "@api/lib/logger";
import { utapi } from "@api/lib/uploadthing";
import {
  FileProvider,
  FileService,
  type FileMetadata,
  type UploadFileParams,
  type UploadResult,
} from "../interface";

/**
 * UploadThing-backed storage: upload/delete/metadata/URL resolution via `env.UPLOADTHING_TOKEN`.
 */
export class UploadThingProvider extends FileService {
  readonly name = "UploadThing";
  readonly provider = FileProvider.UPLOADTHING;

  isConfigured(): boolean {
    return !!env.UPLOADTHING_TOKEN;
  }

  async upload(params: UploadFileParams): Promise<UploadResult> {
    const { file, fileName, folder, metadata } = params;

    // Handle Buffer by converting to File via Uint8Array
    let fileToUpload: File;
    if (Buffer.isBuffer(file)) {
      const uint8Array = new Uint8Array(file);
      const blob = new Blob([uint8Array], { type: params.mimeType || 'application/octet-stream' });
      fileToUpload = new File([blob], fileName || 'file', { 
        type: params.mimeType || 'application/octet-stream' 
      });
    } else {
      fileToUpload = file;
    }

    const response = await utapi.uploadFiles(fileToUpload);

    if (response.error) {
      throw new Error(`Upload failed: ${response.error.message}`);
    }

    const uploadedFile = response.data;

    // Use ufsUrl instead of deprecated url
    const fileUrl = (uploadedFile as any).ufsUrl || uploadedFile.url;

    return {
      id: uploadedFile.key,
      url: fileUrl,
      key: uploadedFile.key,
      name: fileName || uploadedFile.name || 'uploaded-file',
      size: uploadedFile.size,
      mimeType: params.mimeType || 'application/octet-stream',
      metadata,
    };
  }

  async delete(key: string): Promise<boolean> {
    try {
      await utapi.deleteFiles(key);
      return true;
    } catch (error) {
      logger.error({ err: error, key }, "UploadThing delete failed");
      return false;
    }
  }

  async getFile(key: string): Promise<FileMetadata | null> {
    try {
      const files = await utapi.getFileUrls(key);
      const file = files.data[0];
      
      if (!file) return null;

      // Use ufsUrl instead of deprecated url
      const fileUrl = (file as any).ufsUrl || file.url;

      return {
        id: file.key,
        key: file.key,
        url: fileUrl,
        name: key.split('/').pop() || key,
        size: 0,
        mimeType: 'application/octet-stream',
        createdAt: new Date(),
      };
    } catch (error) {
      logger.error({ err: error, key }, "UploadThing getFile failed");
      return null;
    }
  }

  getUrl(key: string): string {
    return `https://utfs.io/f/${key}`;
  }
}
