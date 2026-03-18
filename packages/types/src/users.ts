import { Static, Type as t } from "@sinclair/typebox";

export const UserSchema = t.Object({
  id: t.String(),
  name: t.Union([t.String(), t.Null()]),
  email: t.String(),
  emailVerified: t.Boolean(),
  image: t.Union([t.String(), t.Null()]),
  role: t.Optional(t.String()),
  bio: t.Optional(t.Union([t.String(), t.Null()])),
  skills: t.Optional(t.Array(t.String())),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export type User = Static<typeof UserSchema>;

// Frontend-compatible User type (with string dates and specific role type)
export interface UserFrontend {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  image?: string | null;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  bio?: string | null;
  skills?: string[];
  createdAt: string;
  updatedAt: string;
}

export const UpdateUserSchema = t.Object({
  name: t.Optional(t.String()),
  email: t.Optional(t.String()),
  image: t.Optional(t.String()),
});

export type UpdateUser = Static<typeof UpdateUserSchema>;

export const UserQuerySchema = t.Object({
  page: t.Optional(t.String()),
  limit: t.Optional(t.String()),
  search: t.Optional(t.String()),
  role: t.Optional(t.String()),
});

export type UserQuery = Static<typeof UserQuerySchema>;

// Service-level types
export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: "USER" | "ADMIN" | "SUPER_ADMIN";
}

export interface CreateUserData {
  email: string;
  name?: string;
  password?: string;
  image?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  image?: string;
  emailVerified?: boolean;
  bio?: string | null;
  skills?: string[];
}

export interface UpdateUserSettingsData {
  primaryColor?: string;
  primaryForeground?: string;
  secondaryColor?: string;
  secondaryForeground?: string;
}
