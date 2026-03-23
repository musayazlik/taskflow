/**
 * better-auth routes are mounted via Express (`toNodeHandler(auth)`), so Nest's
 * Swagger scanner does not include them. These entries keep OpenAPI parity.
 */
export function mergeBetterAuthPathsIntoSwaggerDocument(doc: {
  paths: Record<string, Record<string, unknown>>;
}): void {
  Object.assign(doc.paths, BETTER_AUTH_SWAGGER_PATHS);
}

const BETTER_AUTH_SWAGGER_PATHS: Record<string, Record<string, unknown>> = {
  "/api/auth/sign-up/email": {
    post: {
      tags: ["Auth"],
      summary: "Register (email/password)",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "email", "password"],
              properties: {
                name: { type: "string" },
                email: { type: "string", format: "email" },
                password: { type: "string", minLength: 8, maxLength: 128 },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "User registered successfully" },
      },
    },
  },
  "/api/auth/sign-in/email": {
    post: {
      tags: ["Auth"],
      summary: "Login (email/password)",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password"],
              properties: {
                email: { type: "string", format: "email" },
                password: { type: "string", minLength: 8, maxLength: 128 },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "User logged in successfully" },
      },
    },
  },
  "/api/auth/sign-out": {
    post: {
      tags: ["Auth"],
      summary: "Sign out",
      responses: {
        200: { description: "Signed out successfully" },
      },
    },
  },
  "/api/auth/get-session": {
    get: {
      tags: ["Auth"],
      summary: "Get current session",
      responses: {
        200: { description: "Session (user + session) or nulls" },
      },
    },
  },
  "/api/auth/forgot-password": {
    post: {
      tags: ["Auth"],
      summary: "Request password reset (email)",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email"],
              properties: {
                email: { type: "string", format: "email" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Password reset email is sent (if account exists)",
        },
      },
    },
  },
  "/api/auth/reset-password": {
    post: {
      tags: ["Auth"],
      summary: "Reset password (token + newPassword)",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["token", "newPassword"],
              properties: {
                token: { type: "string" },
                newPassword: { type: "string", minLength: 8, maxLength: 128 },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Password reset successfully" },
        400: { description: "Invalid token or bad request" },
      },
    },
  },
  "/api/auth/verify-email": {
    get: {
      tags: ["Auth"],
      summary: "Verify email with token",
      parameters: [
        {
          name: "token",
          in: "query",
          required: true,
          schema: { type: "string" },
        },
        {
          name: "callbackURL",
          in: "query",
          required: false,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: { description: "Email verified (redirect or session)" },
      },
    },
  },
  "/api/auth/send-verification-email": {
    post: {
      tags: ["Auth"],
      summary: "Send verification email (email + callbackURL)",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email"],
              properties: {
                email: { type: "string", format: "email" },
                callbackURL: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Verification email was sent (if allowed)" },
      },
    },
  },
};
