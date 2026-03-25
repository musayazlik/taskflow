/**
 * Shared types for frontend services
 * Re-export from @repo/types for consistency
 */

export type {
  ApiResponse,
  UserFrontend as User,
  AuthResponse,
  PaginatedResponse,
  UserSettings,
  UserSettingsWithId,
  Permission,
  RolePermission,
  ImageOptimizationSettings,
  // Dashboard types
  DashboardStatsFrontend as DashboardStats,
  RecentActivityFrontend as RecentActivity,
  // Media types
  MediaFile,
  MediaListResponse,
  // Settings types
  MediaUploadSettings,
  // System types
  SystemInfo,
} from "@repo/types";

// Import Role from rbac to avoid conflict with string literal Role type
export type { Role } from "@repo/types/rbac";
