/**
 * @fileoverview Storage abstraction (`FileProvider`, `FileService`, `FileServiceFactory`) with UploadThing backend.
 * @module @api/lib/file-service
 */

export {
  FileProvider,
  FileService,
  type UploadFileParams,
  type UploadResult,
  type FileMetadata,
  type SignedUrlOptions,
} from "./interface";
export type { FileService as FileServiceType } from "./interface";

export { FileServiceFactory } from "./factory";
export { UploadThingProvider } from "./providers/uploadthing.provider";

/** @deprecated Prefer {@link FileServiceFactory} — legacy alias used in some imports. */
export { FileServiceFactory as FileUploadService } from "./factory";
