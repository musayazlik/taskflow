type NullableString = string | null;

export type UpdateGlobalSettingsBody = Partial<{
  primaryColor: NullableString;
  primaryForeground: NullableString;
  secondaryColor: NullableString;
  secondaryForeground: NullableString;
}>;

export type UpdateImageOptimizationBody = Partial<{
  enabled: boolean;
  maxWidth: number | null;
  maxHeight: number | null;
  quality: number | null;
  format: string | null;
}>;

export type UpdateMediaUploadBody = Partial<{
  maxFileSize: number;
  maxFileCount: number;
  allowedMimeTypes: string[];
}>;
