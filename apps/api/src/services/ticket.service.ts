import { prisma } from "@repo/database";
import { AppError } from "@api/lib/errors";
import { logger } from "@api/lib/logger";
import { PAGINATION } from "@api/constants";

export interface TicketListParams {
	page?: number;
	limit?: number;
	search?: string;
	status?: "open" | "in_progress" | "closed";
	priority?: "low" | "medium" | "high";
	userId?: string; // For filtering by user (admin can see all, users see only their own)
}

export interface CreateTicketData {
	subject: string;
	description: string;
	priority?: "low" | "medium" | "high";
}

export interface UpdateTicketData {
	subject?: string;
	description?: string;
	status?: "open" | "in_progress" | "closed";
	priority?: "low" | "medium" | "high";
	assignedTo?: string | null;
}

export interface CreateTicketMessageData {
	content: string;
	isInternal?: boolean;
}

/**
 * Get all tickets with pagination and filters
 */
export const getAllTickets = async (
	params: TicketListParams = {},
): Promise<{
	tickets: any[];
	total: number;
	page: number;
	limit: number;
}> => {
	const { page = 1, limit = 20, search, status, priority, userId } = params;
	const skip = (page - 1) * limit;

	try {
		const where: any = {};

		// Filter by user if provided (users see only their own tickets)
		if (userId) {
			where.userId = userId;
		}

		if (status) {
			where.status = status;
		}

		if (priority) {
			where.priority = priority;
		}

		if (search) {
			where.OR = [
				{ subject: { contains: search, mode: "insensitive" } },
				{ description: { contains: search, mode: "insensitive" } },
			];
		}

		const [tickets, total] = await Promise.all([
			prisma.ticket.findMany({
				where,
				skip,
				take: limit,
				orderBy: { createdAt: "desc" },
				include: {
					user: {
						select: {
							id: true,
							email: true,
							name: true,
							image: true,
						},
					},
					assignedUser: {
						select: {
							id: true,
							email: true,
							name: true,
							image: true,
						},
					},
					messages: {
						orderBy: { createdAt: "asc" },
						take: 1, // Get last message for preview
						include: {
							user: {
								select: {
									id: true,
									email: true,
									name: true,
								},
							},
						},
					},
					_count: {
						select: {
							messages: true,
						},
					},
				},
			}),
			prisma.ticket.count({ where }),
		]);

		return {
			tickets,
			total,
			page,
			limit,
		};
	} catch (error) {
		logger.error({ error, params }, "Failed to get tickets");
		throw new AppError(
			"INTERNAL_ERROR",
			"Failed to retrieve tickets",
			500,
		);
	}
};

/**
 * Get a single ticket by ID
 */
export const getTicketById = async (
	ticketId: string,
	userId?: string, // Optional: ensure user can only access their own tickets
): Promise<any> => {
	try {
		const where: any = { id: ticketId };
		if (userId) {
			where.userId = userId;
		}

		const ticket = await prisma.ticket.findFirst({
			where,
			include: {
				user: {
					select: {
						id: true,
						email: true,
						name: true,
						image: true,
					},
				},
				assignedUser: {
					select: {
						id: true,
						email: true,
						name: true,
						image: true,
					},
				},
				messages: {
					orderBy: { createdAt: "asc" },
					include: {
						user: {
							select: {
								id: true,
								email: true,
								name: true,
								image: true,
							},
						},
					},
				},
			},
		});

		if (!ticket) {
			throw new AppError("NOT_FOUND", "Ticket not found", 404);
		}

		return ticket;
	} catch (error) {
		if (error instanceof AppError) {
			throw error;
		}
		logger.error({ error, ticketId }, "Failed to get ticket");
		throw new AppError(
			"INTERNAL_ERROR",
			"Failed to retrieve ticket",
			500,
		);
	}
};

/**
 * Create a new ticket
 */
export const createTicket = async (
	userId: string,
	data: CreateTicketData,
): Promise<any> => {
	try {
		const ticket = await prisma.ticket.create({
			data: {
				subject: data.subject,
				description: data.description,
				priority: data.priority || "medium",
				userId,
			},
			include: {
				user: {
					select: {
						id: true,
						email: true,
						name: true,
						image: true,
					},
				},
			},
		});

		logger.info({ ticketId: ticket.id, userId }, "Ticket created");

		return ticket;
	} catch (error) {
		logger.error({ error, userId, data }, "Failed to create ticket");
		throw new AppError(
			"INTERNAL_ERROR",
			"Failed to create ticket",
			500,
		);
	}
};

/**
 * Update a ticket
 */
export const updateTicket = async (
	ticketId: string,
	data: UpdateTicketData,
	userId?: string, // Optional: ensure user can only update their own tickets (unless admin)
): Promise<any> => {
	try {
		const where: any = { id: ticketId };
		if (userId) {
			// Users can only update their own tickets
			where.userId = userId;
		}

		const existingTicket = await prisma.ticket.findFirst({ where });
		if (!existingTicket) {
			throw new AppError("NOT_FOUND", "Ticket not found", 404);
		}

		const updateData: any = { ...data };
		if (data.status === "closed" && !existingTicket.closedAt) {
			updateData.closedAt = new Date();
		} else if (data.status !== "closed" && existingTicket.closedAt) {
			updateData.closedAt = null;
		}

		const ticket = await prisma.ticket.update({
			where: { id: ticketId },
			data: updateData,
			include: {
				user: {
					select: {
						id: true,
						email: true,
						name: true,
						image: true,
					},
				},
				assignedUser: {
					select: {
						id: true,
						email: true,
						name: true,
						image: true,
					},
				},
			},
		});

		logger.info({ ticketId, data }, "Ticket updated");

		return ticket;
	} catch (error) {
		if (error instanceof AppError) {
			throw error;
		}
		logger.error({ error, ticketId, data }, "Failed to update ticket");
		throw new AppError(
			"INTERNAL_ERROR",
			"Failed to update ticket",
			500,
		);
	}
};

/**
 * Add a message to a ticket
 */
export const addTicketMessage = async (
	ticketId: string,
	userId: string,
	data: CreateTicketMessageData,
	isAdmin: boolean = false, // Admin can add messages to any ticket
): Promise<any> => {
	try {
		// Verify ticket exists
		const where: any = { id: ticketId };
		// Users can only add messages to their own tickets, admins can add to any
		if (!isAdmin) {
			where.userId = userId;
		}

		const ticket = await prisma.ticket.findFirst({
			where,
		});

		if (!ticket) {
			throw new AppError("NOT_FOUND", "Ticket not found", 404);
		}

		const message = await prisma.ticketMessage.create({
			data: {
				ticketId,
				userId,
				content: data.content,
				isInternal: data.isInternal || false,
			},
			include: {
				user: {
					select: {
						id: true,
						email: true,
						name: true,
						image: true,
					},
				},
			},
		});

		// Update ticket's updatedAt
		await prisma.ticket.update({
			where: { id: ticketId },
			data: { updatedAt: new Date() },
		});

		logger.info({ ticketId, messageId: message.id, userId }, "Ticket message added");

		return message;
	} catch (error) {
		if (error instanceof AppError) {
			throw error;
		}
		logger.error({ error, ticketId, userId, data }, "Failed to add ticket message");
		throw new AppError(
			"INTERNAL_ERROR",
			"Failed to add message to ticket",
			500,
		);
	}
};

/**
 * Get ticket statistics
 */
export const getTicketStats = async (
	userId?: string, // Optional: filter by user
): Promise<{
	total: number;
	open: number;
	inProgress: number;
	closed: number;
	byPriority: {
		low: number;
		medium: number;
		high: number;
	};
}> => {
	try {
		const where: any = {};
		if (userId) {
			where.userId = userId;
		}

		const [total, open, inProgress, closed, low, medium, high] =
			await Promise.all([
				prisma.ticket.count({ where }),
				prisma.ticket.count({ where: { ...where, status: "open" } }),
				prisma.ticket.count({
					where: { ...where, status: "in_progress" } },
				),
				prisma.ticket.count({
					where: { ...where, status: "closed" } },
				),
				prisma.ticket.count({
					where: { ...where, priority: "low" } },
				),
				prisma.ticket.count({
					where: { ...where, priority: "medium" } },
				),
				prisma.ticket.count({
					where: { ...where, priority: "high" } },
				),
			]);

		return {
			total,
			open,
			inProgress,
			closed,
			byPriority: {
				low,
				medium,
				high,
			},
		};
	} catch (error) {
		logger.error({ error, userId }, "Failed to get ticket stats");
		throw new AppError(
			"INTERNAL_ERROR",
			"Failed to retrieve ticket statistics",
			500,
		);
	}
};
