/**
 * Shared types for frontend services
 * Re-export from @repo/types for consistency
 */

export type {
  ApiResponse,
  UserFrontend as User,
  AuthResponse,
  ProductFrontend as Product,
  Subscription,
  PaginatedResponse,
  Order,
  Invoice,
  UserSettings,
  UserSettingsWithId,
  Permission,
  RolePermission,
  ImageOptimizationSettings,
  CustomerFrontend as Customer,
  // AI types
  ChatMessage,
  ChatCompletionParams,
  ChatCompletionResponse,
  SEOGenerationParams,
  SEOResult,
  ContentGenerationParams,
  ContentResult,
  ImageGenerationParams,
  GeneratedImage,
  AIManagementRequest,
  AIManagementResponse,
  TokenUsage,
  AIProvider,
  SystemPromptCategory,
  // AI Models types
  AiModelFrontend as AiModel,
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
