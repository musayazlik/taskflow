import { Static, Type as t } from "@sinclair/typebox";

export const SignUpSchema = t.Object({
  email: t.String({ format: "email" }),
  password: t.String(),
  name: t.String(),
  image: t.Optional(t.String()),
});

export type SignUp = Static<typeof SignUpSchema>;

export const SignInSchema = t.Object({
  email: t.String({ format: "email" }),
  password: t.String(),
});

export type SignIn = Static<typeof SignInSchema>;

export const ForgotPasswordSchema = t.Object({
  email: t.String({ format: "email" }),
  redirectTo: t.Optional(t.String()),
});

export type ForgotPassword = Static<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = t.Object({
  newPassword: t.String(),
  token: t.Optional(t.String()),
});

export type ResetPassword = Static<typeof ResetPasswordSchema>;

export const SocialSignInParamsSchema = t.Object({
  provider: t.Literal("google"),
});

export type SocialSignInParams = Static<typeof SocialSignInParamsSchema>;

export const SocialSignInQuerySchema = t.Object({
  redirectTo: t.Optional(t.String()),
});

export type SocialSignInQuery = Static<typeof SocialSignInQuerySchema>;

// ============================================
// Frontend Auth Types
// ============================================

import type { User } from "./users";

export interface AuthResponse {
  user: User;
  session?: {
    token: string;
    expiresAt: string;
  };
}
