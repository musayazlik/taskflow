import { Elysia, t } from "elysia";
import { requireAuth, successResponse } from "@api/lib/route-helpers";
import * as usageService from "@api/services/usage.service";

export const usageRoutes = new Elysia({ prefix: "/usage" })
	// Get usage statistics
	.get(
		"/stats",
		async ({ request: { headers } }) => {
			const session = await requireAuth(headers);

			const stats = await usageService.getUserUsageStats(session.user.id);

			return successResponse(stats);
		},
		{
			detail: {
				tags: ["Usage"],
				summary: "Get usage statistics",
				description:
					"Returns current usage statistics including API calls, storage, features, and bandwidth",
			},
		},
	)

	// Get usage history
	.get(
		"/history",
		async ({ request: { headers }, query }) => {
			const session = await requireAuth(headers);

			const days = query.days ? parseInt(query.days) : 30;

			const history = await usageService.getUserUsageHistory(
				session.user.id,
				days,
			);

			return successResponse(history);
		},
		{
			query: t.Object({
				days: t.Optional(t.String()),
			}),
			detail: {
				tags: ["Usage"],
				summary: "Get usage history",
				description:
					"Returns usage history for the specified number of days (default: 30)",
			},
		},
	);
