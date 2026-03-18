import { baseApi } from "@/lib/api";
import type { ApiResponse, PaginatedResponse } from "./types";

export interface Ticket {
	id: string;
	subject: string;
	description: string;
	status: "open" | "in_progress" | "closed";
	priority: "low" | "medium" | "high";
	userId: string;
	assignedTo?: string | null;
	createdAt: string;
	updatedAt: string;
	closedAt?: string | null;
	user: {
		id: string;
		email: string;
		name: string | null;
		image: string | null;
	};
	assignedUser?: {
		id: string;
		email: string;
		name: string | null;
		image: string | null;
	} | null;
	messages: TicketMessage[];
	_count: {
		messages: number;
	};
}

export interface TicketMessage {
	id: string;
	ticketId: string;
	userId: string;
	content: string;
	isInternal: boolean;
	createdAt: string;
	updatedAt: string;
	user: {
		id: string;
		email: string;
		name: string | null;
		image: string | null;
	};
}

export interface TicketStats {
	total: number;
	open: number;
	inProgress: number;
	closed: number;
	byPriority: {
		low: number;
		medium: number;
		high: number;
	};
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

export const ticketService = {
	async getTickets(params?: {
		page?: number;
		limit?: number;
		search?: string;
		status?: "open" | "in_progress" | "closed";
		priority?: "low" | "medium" | "high";
	}): Promise<ApiResponse<PaginatedResponse<Ticket>>> {
		try {
			const { data, error } = await baseApi.tickets.get({
				query: {
					page: params?.page?.toString(),
					limit: params?.limit?.toString(),
					search: params?.search,
					status: params?.status,
					priority: params?.priority,
				},
			});

			if (error) {
				return {
					success: false,
					error: "Request failed",
					message: String(error.value) || "Failed to fetch tickets",
				};
			}

			return {
				success: true,
				data: data as unknown as PaginatedResponse<Ticket>,
			};
		} catch {
			return {
				success: false,
				error: "Network Error",
				message: "Failed to connect to server",
			};
		}
	},

	async getTicketById(id: string): Promise<ApiResponse<Ticket>> {
		try {
			const { data, error } = await (baseApi.tickets as any)[id].get();

			if (error) {
				return {
					success: false,
					error: "Request failed",
					message: String(error.value) || "Failed to fetch ticket",
				};
			}

			// Eden Treaty returns { success: true, data: {...} }
			const response = data as { success?: boolean; data?: Ticket };
			const ticketData = response?.data || response;

			return {
				success: true,
				data: ticketData as Ticket,
			};
		} catch {
			return {
				success: false,
				error: "Network Error",
				message: "Failed to connect to server",
			};
		}
	},

	async createTicket(
		data: CreateTicketData,
	): Promise<ApiResponse<Ticket>> {
		try {
			const { data: responseData, error } = await (baseApi.tickets.post as any)({
				subject: data.subject,
				description: data.description,
				priority: data.priority,
			});

			if (error) {
				return {
					success: false,
					error: "Request failed",
					message: String(error.value) || "Failed to create ticket",
				};
			}

			return {
				success: true,
				data: responseData as unknown as Ticket,
			};
		} catch {
			return {
				success: false,
				error: "Network Error",
				message: "Failed to connect to server",
			};
		}
	},

	async updateTicket(
		id: string,
		data: UpdateTicketData,
	): Promise<ApiResponse<Ticket>> {
		try {
			const { data: responseData, error } = await (baseApi.tickets as any)[id].patch(data);

			if (error) {
				return {
					success: false,
					error: "Request failed",
					message: String(error.value) || "Failed to update ticket",
				};
			}

			return {
				success: true,
				data: responseData as unknown as Ticket,
			};
		} catch {
			return {
				success: false,
				error: "Network Error",
				message: "Failed to connect to server",
			};
		}
	},

	async addTicketMessage(
		ticketId: string,
		data: CreateTicketMessageData,
	): Promise<ApiResponse<TicketMessage>> {
		try {
			const { data: responseData, error } =
				await ((baseApi.tickets as any)[ticketId].messages.post as any)({
					content: data.content,
					isInternal: data.isInternal,
				});

			if (error) {
				return {
					success: false,
					error: "Request failed",
					message: String(error.value) || "Failed to add message",
				};
			}

			return {
				success: true,
				data: responseData as unknown as TicketMessage,
			};
		} catch {
			return {
				success: false,
				error: "Network Error",
				message: "Failed to connect to server",
			};
		}
	},

	async getTicketStats(): Promise<ApiResponse<TicketStats>> {
		try {
			const { data, error } = await baseApi.tickets.stats.get();

			if (error) {
				return {
					success: false,
					error: "Request failed",
					message: String(error.value) || "Failed to fetch ticket stats",
				};
			}

			return {
				success: true,
				data: data as unknown as TicketStats,
			};
		} catch {
			return {
				success: false,
				error: "Network Error",
				message: "Failed to connect to server",
			};
		}
	},
};
