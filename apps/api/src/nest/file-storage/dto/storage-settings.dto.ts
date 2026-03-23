import type { FileProvider } from "@api/lib/file-service";

export type StorageSettingsUpdateBody = {
  defaultProvider: FileProvider;
  uploadthingToken?: string;
  selectionRules?: Record<string, string>;
};
