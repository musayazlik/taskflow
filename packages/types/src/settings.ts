// ============================================
// Settings Types
// ============================================

export interface ImageOptimizationSettingsDTO {
  enabled: boolean;
  maxWidth: number | null;
  maxHeight: number | null;
  quality: number | null;
  format: string | null;
}

// Frontend-compatible type (same structure)
export interface ImageOptimizationSettings {
  enabled: boolean;
  maxWidth: number | null;
  maxHeight: number | null;
  quality: number | null;
  format: string | null;
}

// Media upload settings
export interface MediaUploadSettings {
  maxFileSize: number;
  maxFileCount: number;
  allowedMimeTypes: string[];
}
