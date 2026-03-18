/**
 * File Service Module
 * UploadThing-based file management
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

// Re-export for convenience
export { FileServiceFactory as FileUploadService } from "./factory";
