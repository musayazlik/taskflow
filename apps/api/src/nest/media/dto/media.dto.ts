export type MediaListQuery = {
  limit?: string;
  offset?: string;
};

export type OptimizeImageBody = {
  quality?: number;
  format?: "webp" | "jpeg" | "png" | "original";
  maxWidth?: number;
  maxHeight?: number;
};
