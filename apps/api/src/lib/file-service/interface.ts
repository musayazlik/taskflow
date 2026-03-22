/**
 * @fileoverview Abstract file storage contract and UploadThing-oriented types.
 * @module @api/lib/file-service/interface
 */

/**
 * Supported storage backends (extend when adding new providers).
 */
export enum FileProvider {
  UPLOADTHING = "UPLOADTHING",
}

/** Options for signed / CDN URL generation (provider-specific). */
export interface SignedUrlOptions {
  expiresIn?: string | number;
  contentDisposition?: "inline" | "attachment";
}

/** Parameters for a single upload operation. */
export interface UploadFileParams {
  file: File | Buffer;
  fileName?: string;
  folder?: string;
  mimeType?: string;
  metadata?: Record<string, string>;
}

/** Normalized result after a successful upload. */
export interface UploadResult {
  id: string;
  url: string;
  key: string;
  name: string;
  size: number;
  mimeType: string;
  metadata?: Record<string, string>;
}

/** Rich file record (DB or provider metadata). */
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

/**
 * Pluggable storage backend. Implementations live under `providers/`.
 */
export abstract class FileService {
  abstract readonly name: string;
  abstract readonly provider: FileProvider;

  /** Upload bytes and return provider identifiers. */
  abstract upload(params: UploadFileParams): Promise<UploadResult>;

  /** Delete by storage key; returns whether deletion succeeded. */
  abstract delete(key: string): Promise<boolean>;

  /** Fetch metadata if the file exists. */
  abstract getFile(key: string): Promise<FileMetadata | null>;

  /** Public or CDN URL for the given key. */
  abstract getUrl(key: string): string;

  /** Whether API credentials / token are present for this provider. */
  abstract isConfigured(): boolean;
}
