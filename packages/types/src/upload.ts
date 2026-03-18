// ============================================
// Upload Types
// ============================================

export interface UploadResult {
  url: string;
  key: string;
  name: string;
  size: number;
}

// Media service types
export interface MediaFile {
  key: string;
  name: string;
  size: number;
  uploadedAt: number;
  url: string;
  type: string;
  customId?: string | null;
}

export interface MediaListResponse {
  files: MediaFile[];
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
