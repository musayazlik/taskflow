import { Static, Type as t } from "@sinclair/typebox";
import { UserSchema } from "./users.js";

// Global Settings Schema (for public landing page)
export const GlobalSettingsSchema = t.Object({
  id: t.String(),
  primaryColor: t.Union([t.String(), t.Null()]),
  primaryForeground: t.Union([t.String(), t.Null()]),
  secondaryColor: t.Union([t.String(), t.Null()]),
  secondaryForeground: t.Union([t.String(), t.Null()]),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export type GlobalSettings = Static<typeof GlobalSettingsSchema>;

// User Settings Schema (per-user settings)
export const SettingsSchema = t.Object({
  id: t.String(),
  userId: t.String(),
  primaryColor: t.Union([t.String(), t.Null()]),
  primaryForeground: t.Union([t.String(), t.Null()]),
  secondaryColor: t.Union([t.String(), t.Null()]),
  secondaryForeground: t.Union([t.String(), t.Null()]),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export type Settings = Static<typeof SettingsSchema>;

// ============================================
// User Settings Types (Frontend compatible)
// ============================================

export interface UserSettings {
  primaryColor: string | null;
  primaryForeground: string | null;
  secondaryColor: string | null;
  secondaryForeground: string | null;
}

export interface UserSettingsWithId extends UserSettings {
  id: string;
  userId: string;
}

export const UpdateProfileSchema = t.Object({
  name: t.Optional(t.String()),
  email: t.Optional(t.String({ format: "email" })),
  bio: t.Optional(t.Union([t.String(), t.Null()])),
  skills: t.Optional(t.Array(t.String())),
});

export type UpdateProfile = Static<typeof UpdateProfileSchema>;

export const ChangePasswordSchema = t.Object({
  currentPassword: t.String({ minLength: 1 }),
  newPassword: t.String({ minLength: 8 }),
});

export type ChangePassword = Static<typeof ChangePasswordSchema>;

export const UpdateSettingsSchema = t.Object({
  primaryColor: t.Optional(t.String()),
  primaryForeground: t.Optional(t.String()),
  secondaryColor: t.Optional(t.String()),
  secondaryForeground: t.Optional(t.String()),
});

export type UpdateSettings = Static<typeof UpdateSettingsSchema>;

export const UploadAvatarSchema = t.Object({
  avatar: t.Any(), // t.File() is Elysia specific, using Any for shared schema or just omit t.File if possible.
  // Wait, t.File() is TypeBox? No, Elysia extensions.
  // TypeBox doesn't have File.
  // So I can't easily share 't.File()' in a pure Typebox package unless I mock it.
  // I'll probably have to keep the File definition in the route or use t.Any() here.
  // I'll use t.Any() and comment.
});

export type UploadAvatar = Static<typeof UploadAvatarSchema>;
