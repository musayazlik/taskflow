import { Elysia, t } from "elysia";
import * as userService from "@api/services/user.service";
import { AppError } from "@api/lib/errors";
import { logger } from "@api/lib/logger";
import { generateRandomPassword } from "@api/lib/utils";
import { sendWelcomeEmail } from "@api/emails";
import { env } from "@api/lib/env";
import { PAGINATION } from "@api/constants";
import { UserSchema, UserQuerySchema } from "@repo/types";
import { requireAdmin, getSession } from "@api/lib/route-helpers";

export const usersRoutes = new Elysia({ prefix: "/users" })
	.derive(async ({ request: { headers } }) => {
		const session = await getSession(headers);
		return { user: session?.user };
	})
	.get(
		"/",
		async ({ request: { headers }, query }) => {
			await requireAdmin(headers);
			
			const params = {
				page: query.page ? parseInt(query.page) : PAGINATION.DEFAULT_PAGE,
				limit: query.limit ? parseInt(query.limit) : PAGINATION.DEFAULT_LIMIT,
				search: query.search,
				role: query.role as any,
			};
			const result = await userService.getAllUsers(params);
			return {
				success: true,
				data: result.users,
				meta: {
					total: result.total,
					page: result.page,
					limit: result.limit,
					totalPages: Math.ceil(result.total / result.limit),
				},
			};
		},
		{
			query: UserQuerySchema,
			detail: {
				tags: ["Users"],
				summary: "List all users",
				description: "Returns paginated list of users with filters",
			},
			response: t.Object({
				success: t.Boolean(),
				data: t.Array(UserSchema),
				meta: t.Object({
					total: t.Number(),
					page: t.Number(),
					limit: t.Number(),
					totalPages: t.Number(),
				}),
			}),
		},
	)

	.get(
		"/:id",
		async ({ request: { headers }, params }) => {
			await requireAdmin(headers);
			
			const user = await userService.getUserById(params.id);
			if (!user) {
				throw new AppError("USER_NOT_FOUND", "User not found", 404);
			}
			const { password, ...userWithoutPassword } = user;
			return { success: true, data: userWithoutPassword };
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			detail: {
				tags: ["Users"],
				summary: "Get user by ID",
				description: "Returns a single user's details",
			},
			response: t.Object({
				success: t.Boolean(),
				data: UserSchema,
			}),
		},
	)

	.patch(
		"/:id",
		async ({ request: { headers }, params, body }) => {
			await requireAdmin(headers);
			
			const user = await userService.updateUser(params.id, body as any);
			const { password, ...userWithoutPassword } = user;
			return { success: true, data: userWithoutPassword };
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: t.Object({
				name: t.Optional(t.String()),
				email: t.Optional(t.String()),
				image: t.Optional(t.String()),
			}),
			detail: {
				tags: ["Users"],
				summary: "Update user",
				description: "Updates a user's profile information",
			},
			response: t.Object({
				success: t.Boolean(),
				data: UserSchema,
			}),
		},
	)

	.delete(
		"/:id",
		async ({ request: { headers }, params, user }) => {
			await requireAdmin(headers);
			
			if (params.id === user?.id) {
				throw new AppError(
					"INVALID_OPERATION",
					"Cannot delete your own account from admin panel",
					400,
				);
			}
			await userService.deleteUser(params.id);
			return { success: true, message: "User deleted successfully" };
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			detail: {
				tags: ["Users"],
				summary: "Delete user",
				description: "Permanently deletes a user account",
			},
			response: t.Object({
				success: t.Boolean(),
				message: t.String(),
			}),
		},
	)

	.post(
		"/bulk-delete",
		async ({ request: { headers }, body, user }) => {
			await requireAdmin(headers);
			
			const { ids } = body;

			if (ids.includes(user?.id || "")) {
				throw new AppError(
					"INVALID_OPERATION",
					"Cannot delete your own account",
					400,
				);
			}

			let deleted = 0;
			let failed = 0;

			for (const id of ids) {
				try {
					await userService.deleteUser(id);
					deleted++;
				} catch {
					failed++;
				}
			}

			return {
				success: true,
				message: `${deleted} users deleted${failed > 0 ? `, ${failed} failed` : ""}`,
				deleted,
				failed,
			};
		},
		{
			body: t.Object({
				ids: t.Array(t.String(), { minItems: 1 }),
			}),
			detail: {
				tags: ["Users"],
				summary: "Bulk delete users",
				description: "Delete multiple users at once",
			},
		},
	)

	.post(
		"/bulk-verify",
		async ({ request: { headers }, body }) => {
			await requireAdmin(headers);
			
			const { ids } = body;

			let verified = 0;
			let failed = 0;

			for (const id of ids) {
				try {
					await userService.verifyUserEmail(id);
					verified++;
				} catch {
					failed++;
				}
			}

			return {
				success: true,
				message: `${verified} users verified${failed > 0 ? `, ${failed} failed` : ""}`,
				verified,
				failed,
			};
		},
		{
			body: t.Object({
				ids: t.Array(t.String(), { minItems: 1 }),
			}),
			detail: {
				tags: ["Users"],
				summary: "Bulk verify users",
				description: "Verify multiple users' emails at once",
			},
		},
	)

	.post(
		"/bulk-unverify",
		async ({ request: { headers }, body }) => {
			await requireAdmin(headers);
			
			const { ids } = body;

			let unverified = 0;
			let failed = 0;

			for (const id of ids) {
				try {
					await userService.unverifyUserEmail(id);
					unverified++;
				} catch {
					failed++;
				}
			}

			return {
				success: true,
				message: `${unverified} users deactivated${failed > 0 ? `, ${failed} failed` : ""}`,
				unverified,
				failed,
			};
		},
		{
			body: t.Object({
				ids: t.Array(t.String(), { minItems: 1 }),
			}),
			detail: {
				tags: ["Users"],
				summary: "Bulk unverify users",
				description: "Unverify multiple users' emails (deactivate) at once",
			},
		},
	)

	.post(
		"/create",
		async ({ request: { headers }, body }) => {
			await requireAdmin(headers);
			
			const result = await userService.adminCreateUser({
				email: body.email,
				name: body.name,
				role: body.role,
				password: body.password,
			});

			const loginUrl = `${env.FRONTEND_URL}/login`;

			logger.info({ email: result.user.email }, "Sending welcome email");
			try {
				await sendWelcomeEmail({
					to: result.user.email,
					userName: result.user.name || undefined,
					tempPassword: result.password,
					loginUrl,
				});
				logger.info({ email: result.user.email }, "Welcome email sent successfully");
			} catch (error) {
				logger.error({ err: error, email: result.user.email }, "Failed to send welcome email");
			}

			const { password, ...userWithoutPassword } = result.user;

			return {
				success: true,
				data: userWithoutPassword,
				message: "User created successfully. Welcome email sent.",
			};
		},
		{
			body: t.Object({
				email: t.String({ format: "email" }),
				name: t.String({ minLength: 2 }),
				role: t.Union([t.Literal("USER"), t.Literal("ADMIN"), t.Literal("SUPER_ADMIN")]),
				password: t.String({ minLength: 8 }),
			}),
			detail: {
				tags: ["Users"],
				summary: "Create user (Admin)",
				description: "Creates a new user with specified password. Sends welcome email with credentials.",
			},
		},
	)

	.get(
		"/generate-password",
		async ({ request: { headers } }) => {
			await requireAdmin(headers);
			
			const password = generateRandomPassword();
			return {
				success: true,
				data: { password },
			};
		},
		{
			detail: {
				tags: ["Users"],
				summary: "Generate random password",
				description: "Generates a random secure password for new user creation",
			},
		},
	)

	.post(
		"/:id/send-password-reset",
		async ({ request: { headers }, params }) => {
			await requireAdmin(headers);
			
			const user = await userService.getUserById(params.id);

			if (!user) {
				throw new AppError("USER_NOT_FOUND", "User not found", 404);
			}

			try {
				logger.info({ email: user.email }, "Triggering password reset for user");
				const backendUrl = `http://localhost:${env.PORT}`;
				const forgetPasswordRequest = new Request(`${backendUrl}/api/auth/forgot-password`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						email: user.email,
						redirectTo: `${env.FRONTEND_URL}/reset-password`,
					}),
				});
				const { auth } = await import("@api/lib/auth");
				const response = await auth.handler(forgetPasswordRequest);
				logger.info({ email: user.email, status: response.status }, "Forget password handler response");
				if (!response.ok) {
					const text = await response.text();
					logger.error({ email: user.email, error: text }, "Forget password handler error");
					throw new Error(text);
				}
			} catch (error) {
				logger.error({ err: error, email: user.email }, "Failed to send password reset email");
				throw new AppError("EMAIL_SEND_ERROR", "Failed to send password reset email", 500);
			}

			return {
				success: true,
				message: "Password reset email sent successfully",
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			detail: {
				tags: ["Users"],
				summary: "Send password reset email",
				description: "Sends a password reset email to the specified user",
			},
			response: t.Object({
				success: t.Boolean(),
				message: t.String(),
			}),
		},
	)

	.post(
		"/:id/verify-email",
		async ({ request: { headers }, params }) => {
			await requireAdmin(headers);
			
			const user = await userService.verifyUserEmail(params.id);
			const { password, ...userWithoutPassword } = user;

			return {
				success: true,
				data: userWithoutPassword,
				message: "User email verified successfully",
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			detail: {
				tags: ["Users"],
				summary: "Verify user email",
				description: "Manually verifies a user's email address",
			},
		},
	)

	.post(
		"/:id/unverify-email",
		async ({ request: { headers }, params }) => {
			await requireAdmin(headers);
			
			const user = await userService.unverifyUserEmail(params.id);
			const { password, ...userWithoutPassword } = user;

			return {
				success: true,
				data: userWithoutPassword,
				message: "User email unverified successfully",
			};
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			detail: {
				tags: ["Users"],
				summary: "Unverify user email",
				description: "Removes verification status from a user's email",
			},
		},
	)
