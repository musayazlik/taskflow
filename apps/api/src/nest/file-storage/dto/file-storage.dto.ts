import type { FileProvider } from "@api/lib/file-service";

export type FileStorageListQuery = {
  limit?: string;
  offset?: string;
  folder?: string;
};

export type FileStorageUploadBody = {
  folder?: string;
  provider?: FileProvider;
  metadata?: Record<string, string>;
};

export type MigrateFileBody = {
  targetProvider: FileProvider;
};
