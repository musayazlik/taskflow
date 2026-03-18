/**
 * UploadThing Provider Implementation
 */

import { UTApi } from "uploadthing/server";
import { env } from "@api/lib/env";
import { logger } from "@api/lib/logger";
import {
  FileProvider,
  FileService,
  type FileMetadata,
  type UploadFileParams,
  type UploadResult,
} from "../interface";

export class UploadThingProvider extends FileService {
  readonly name = "UploadThing";
  readonly provider = FileProvider.UPLOADTHING;
  private utapi: UTApi;

  constructor() {
    super();
    if (!env.UPLOADTHING_TOKEN) {
      logger.warn(
        "UPLOADTHING_TOKEN not configured. UploadThing provider will not work. Get your token from https://uploadthing.com/dashboard",
      );
    }
    this.utapi = new UTApi({
      token: env.UPLOADTHING_TOKEN || "",
    });
  }

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

    const response = await this.utapi.uploadFiles(fileToUpload);

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
      await this.utapi.deleteFiles(key);
      return true;
    } catch (error) {
      logger.error({ err: error, key }, "UploadThing delete failed");
      return false;
    }
  }

  async getFile(key: string): Promise<FileMetadata | null> {
    try {
      const files = await this.utapi.getFileUrls(key);
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
