/**
 * File Service Interface
 * UploadThing-based file management
 */

/**
 * File storage provider types
 */
export enum FileProvider {
  UPLOADTHING = "UPLOADTHING",
}

/**
 * Options for generating signed URLs
 */
export interface SignedUrlOptions {
  expiresIn?: string | number;
  contentDisposition?: "inline" | "attachment";
}

export interface UploadFileParams {
  file: File | Buffer;
  fileName?: string;
  folder?: string;
  mimeType?: string;
  metadata?: Record<string, string>;
}

export interface UploadResult {
  id: string;
  url: string;
  key: string;
  name: string;
  size: number;
  mimeType: string;
  metadata?: Record<string, string>;
}

export interface FileMetadata {
  id: string;
  key: string;
  url: string;
  name: string;
  size: number;
  mimeType: string;
  createdAt: Date;
  metadata?: Record<string, string>;
}

export abstract class FileService {
  abstract readonly name: string;
  abstract readonly provider: FileProvider;

  /**
   * Upload a file
   */
  abstract upload(params: UploadFileParams): Promise<UploadResult>;

  /**
   * Delete a file
   */
  abstract delete(key: string): Promise<boolean>;

  /**
   * Get file metadata
   */
  abstract getFile(key: string): Promise<FileMetadata | null>;

  /**
   * Get public URL for a file
   */
  abstract getUrl(key: string): string;

  /**
   * Check if service is configured
   */
  abstract isConfigured(): boolean;
}
