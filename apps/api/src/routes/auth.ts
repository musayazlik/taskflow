import { Elysia } from "elysia";
import { auth } from "@api/lib/auth";
import * as userService from "@api/services/user.service";
import * as customerService from "@api/services/customer.service";
import { AppError } from "@api/lib/errors";
import { logger } from "@api/lib/logger";
import { env } from "@api/lib/env";
import { sendPasswordResetEmail } from "@api/emails";
import { prisma } from "@repo/database";

/**
 * Better Auth Plugin - PUBLIC endpoints
 * All Better Auth endpoints are public (login, signup, forgot-password, etc.)
 * Mounted at /api/auth/*
 */
export const betterAuthPlugin = new Elysia({
  name: "better-auth",
  prefix: "/auth",
})
  // Sign up with email - creates Polar customer after successful registration
  .post("/sign-up/email", async (ctx) => {
    const response = await auth.handler(ctx.request);

    if (response instanceof Response) {
      const cloned = response.clone();
      try {
        const data = await cloned.json();
        if (data?.user?.id && data?.user?.email) {
          void customerService
            .createPolarCustomerForUser(
              data.user.id,
              data.user.email,
              data.user.name || undefined,
            )
            .catch((error) => {
              logger.error({ err: error, userId: data.user.id }, "Failed to create Polar customer after signup");
            });
        }
      } catch {
        // Ignore parse errors
      }
    }

    return response;
  })
  // Sign in with email
  .post("/sign-in/email", async (ctx) => {
    return auth.handler(ctx.request);
  })
  // Sign out
  .post("/sign-out", async (ctx) => {
    return auth.handler(ctx.request);
  })
  // Get current session
  .get("/get-session", async (ctx) => {
    const session = await auth.api.getSession({ headers: ctx.request.headers });

    if (!session) {
      return new Response(JSON.stringify({ user: null, session: null }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        user: session.user,
        session: session.session,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  })

  .post("/forgot-password", async (ctx) => {
    logger.info("Forgot password request received");
    try {
      const body = await ctx.request.json();
      const { email } = body as { email: string };

      if (!email) {
        return new Response(
          JSON.stringify({ success: false, error: "Email is required" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      // Use Better Auth's requestPasswordReset API
      const result = await auth.api.requestPasswordReset({
        body: {
          email: email.toLowerCase(),
          redirectTo: `${env.FRONTEND_URL}/reset-password`,
        },
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: "Password reset email sent if account exists",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    } catch (error) {
      logger.error({ err: error }, "Forgot password error");
      return new Response(
        JSON.stringify({
          success: true,
          message: "Password reset email sent if account exists",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }
  })
  // Reset password - Use Better Auth's built-in resetPassword API
  .post("/reset-password", async (ctx) => {
    logger.info("Reset password request received");
    try {
      const body = await ctx.request.json();
      const { token, newPassword } = body as {
        token: string;
        newPassword: string;
      };

      if (!token || !newPassword) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Token and new password are required",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      // Use Better Auth's resetPassword API
      // This will correctly handle password hashing and account updates
      const response = await auth.api.resetPassword({
        body: {
          token,
          newPassword,
        },
      });

      logger.info("Password reset successfully via Better Auth");
      return new Response(
        JSON.stringify({
          success: true,
          message: "Password has been reset successfully",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    } catch (error) {
      logger.error({ err: error }, "Reset password error");
      const errorMessage = error instanceof Error ? error.message : "Failed to reset password";
      return new Response(
        JSON.stringify({ success: false, error: errorMessage }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
  })
  // Verify email
  .get("/verify-email", async (ctx) => {
    return auth.handler(ctx.request);
  })
  // Resend verification email
  .post("/send-verification-email", async (ctx) => {
    return auth.handler(ctx.request);
  })
  // Social sign in
  .post("/sign-in/social", async (ctx) => {
    return auth.handler(ctx.request);
  })
  // OAuth providers
  .get("/oauth/:provider/start", async (ctx) => {
    return auth.handler(ctx.request);
  })
  .get("/oauth/:provider/callback", async (ctx) => {
    return auth.handler(ctx.request);
  })
  // Catch-all: Handle any other Better Auth routes
  .all("/*", async ({ request }) => {
    const url = new URL(request.url);
    logger.debug({ method: request.method, pathname: url.pathname }, "Catch-all auth route");
    const response = await auth.handler(request);
    logger.debug({ method: request.method, pathname: url.pathname, status: response.status }, "Catch-all auth response");
    return response;
  });

/**
 * Protected Auth Routes - PROTECTED endpoints
 * All routes require authentication
 * Mounted at /api/user/*
 */
export const authRoutes = new Elysia({
  prefix: "/user",
})
  .derive(async ({ request: { headers } }) => {
    const session = await auth.api.getSession({ headers });

    if (!session) {
      throw new AppError("UNAUTHORIZED", "Unauthorized", 401);
    }

    return {
      user: session.user,
      session: session.session,
    };
  })
  .get("/me", async ({ user }) => {
    const fullUser = await userService.getUserById(user.id);

    if (!fullUser) {
      throw new AppError("USER_NOT_FOUND", "User not found", 404);
    }

    const { password, ...safeUser } = fullUser;
    return { success: true, data: safeUser };
  })
  .patch("/me", async ({ user, body }: { user: any; body: any }) => {
    const updated = await userService.updateUser(user.id, body);
    const { password, ...safeUser } = updated;
    return { success: true, data: safeUser };
  })
  .delete("/me", async ({ user }) => {
    await userService.deleteUser(user.id);
    return { success: true, message: "Account deleted successfully" };
  });
