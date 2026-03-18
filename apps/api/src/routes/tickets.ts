import { Elysia, t } from "elysia";
import { AppError } from "@api/lib/errors";
import {
	requireAuth,
	requireAdmin,
	successResponse,
	paginatedResponse,
} from "@api/lib/route-helpers";
import * as ticketService from "@api/services/ticket.service";
import { PAGINATION } from "@api/constants";

export const ticketRoutes = new Elysia({ prefix: "/tickets" })
	// Get all tickets (users see only their own, admins see all)
	.get(
		"/",
		async ({ request: { headers }, query }) => {
			const session = await requireAuth(headers);
			const isAdminUser =
				session.user.role === "ADMIN" ||
				session.user.role === "SUPER_ADMIN";

			const page = query.page ? parseInt(query.page) : 1;
			const limit = query.limit
				? parseInt(query.limit)
				: PAGINATION.DEFAULT_LIMIT;

			const params: ticketService.TicketListParams = {
				page,
				limit,
				search: query.search,
				status: query.status as any,
				priority: query.priority as any,
				// Users see only their own tickets, admins see all
				userId: isAdminUser ? undefined : session.user.id,
			};

			const result = await ticketService.getAllTickets(params);

			return paginatedResponse(
				result.tickets,
				result.total,
				result.page,
				result.limit,
			);
		},
		{
			query: t.Object({
				page: t.Optional(t.String()),
				limit: t.Optional(t.String()),
				search: t.Optional(t.String()),
				status: t.Optional(
					t.Union([
						t.Literal("open"),
						t.Literal("in_progress"),
						t.Literal("closed"),
					]),
				),
				priority: t.Optional(
					t.Union([
						t.Literal("low"),
						t.Literal("medium"),
						t.Literal("high"),
					]),
				),
			}),
			detail: {
				tags: ["Tickets"],
				summary: "Get all tickets",
				description:
					"Returns list of tickets. Users see only their own tickets, admins see all.",
			},
		},
	)

	// Get ticket statistics
	.get(
		"/stats",
		async ({ request: { headers } }) => {
			const session = await requireAuth(headers);
			const isAdminUser =
				session.user.role === "ADMIN" ||
				session.user.role === "SUPER_ADMIN";

			const stats = await ticketService.getTicketStats(
				isAdminUser ? undefined : session.user.id,
			);

			return successResponse(stats);
		},
		{
			detail: {
				tags: ["Tickets"],
				summary: "Get ticket statistics",
				description:
					"Returns ticket statistics. Users see only their own stats, admins see all.",
			},
		},
	)

	// Get a single ticket by ID
	.get(
		"/:id",
		async ({ request: { headers }, params }) => {
			const session = await requireAuth(headers);
			const isAdminUser =
				session.user.role === "ADMIN" ||
				session.user.role === "SUPER_ADMIN";

			const ticket = await ticketService.getTicketById(
				params.id,
				isAdminUser ? undefined : session.user.id,
			);

			return successResponse(ticket);
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			detail: {
				tags: ["Tickets"],
				summary: "Get ticket by ID",
				description:
					"Returns a single ticket. Users can only access their own tickets.",
			},
		},
	)

	// Create a new ticket
	.post(
		"/",
		async ({ request: { headers }, body }) => {
			const session = await requireAuth(headers);

			const ticket = await ticketService.createTicket(
				session.user.id,
				{
					subject: body.subject,
					description: body.description,
					priority: body.priority,
				},
			);

			return successResponse(ticket, "Ticket created successfully");
		},
		{
			body: t.Object({
				subject: t.String({ minLength: 1, maxLength: 200 }),
				description: t.String({ minLength: 1, maxLength: 5000 }),
				priority: t.Optional(
					t.Union([
						t.Literal("low"),
						t.Literal("medium"),
						t.Literal("high"),
					]),
				),
			}),
			detail: {
				tags: ["Tickets"],
				summary: "Create a new ticket",
				description: "Creates a new support ticket",
			},
		},
	)

	// Update a ticket
	.patch(
		"/:id",
		async ({ request: { headers }, params, body }) => {
			const session = await requireAuth(headers);
			const isAdminUser =
				session.user.role === "ADMIN" ||
				session.user.role === "SUPER_ADMIN";

			const ticket = await ticketService.updateTicket(
				params.id,
				{
					subject: body.subject,
					description: body.description,
					status: body.status,
					priority: body.priority,
					assignedTo: body.assignedTo,
				},
				isAdminUser ? undefined : session.user.id,
			);

			return successResponse(ticket, "Ticket updated successfully");
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: t.Object({
				subject: t.Optional(t.String({ maxLength: 200 })),
				description: t.Optional(t.String({ maxLength: 5000 })),
				status: t.Optional(
					t.Union([
						t.Literal("open"),
						t.Literal("in_progress"),
						t.Literal("closed"),
					]),
				),
				priority: t.Optional(
					t.Union([
						t.Literal("low"),
						t.Literal("medium"),
						t.Literal("high"),
					]),
				),
				assignedTo: t.Optional(t.Union([t.String(), t.Null()])),
			}),
			detail: {
				tags: ["Tickets"],
				summary: "Update a ticket",
				description:
					"Updates a ticket. Users can only update their own tickets, admins can update any ticket.",
			},
		},
	)

	// Add a message to a ticket
	.post(
		"/:id/messages",
		async ({ request: { headers }, params, body }) => {
			const session = await requireAuth(headers);
			const isAdminUser =
				session.user.role === "ADMIN" ||
				session.user.role === "SUPER_ADMIN";

			// Admin can add messages to any ticket, users only to their own
			const ticket = await ticketService.getTicketById(
				params.id,
				isAdminUser ? undefined : session.user.id,
			);

			const message = await ticketService.addTicketMessage(
				params.id,
				session.user.id,
				{
					content: body.content,
					isInternal: body.isInternal && isAdminUser ? true : false,
				},
				isAdminUser, // Pass admin flag
			);

			return successResponse(message, "Message added successfully");
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: t.Object({
				content: t.String({ minLength: 1, maxLength: 5000 }),
				isInternal: t.Optional(t.Boolean()),
			}),
			detail: {
				tags: ["Tickets"],
				summary: "Add a message to a ticket",
				description:
					"Adds a message to a ticket. Only admins can add internal messages.",
			},
		},
	);
