import { prisma } from "@repo/database";
import type { User } from "@repo/database";
import { AppError } from "@api/lib/errors";
import { generateRandomPassword } from "@api/lib/utils";
import { logger } from "@api/lib/logger";
import type {
	UserListParams,
	CreateUserData,
	UpdateUserData,
} from "@repo/types";
import { hashPassword } from "better-auth/crypto";

export const getAllUsers = async (
	params: UserListParams = {},
): Promise<{ users: User[]; total: number; page: number; limit: number }> => {
	const { page = 1, limit = 20, search, role } = params;
	const skip = (page - 1) * limit;

	try {
		const where: any = {
			// Always exclude SUPER_ADMIN users from listing
			role: { not: "SUPER_ADMIN" },
		};

		if (search) {
			where.OR = [
				{ email: { contains: search, mode: "insensitive" } },
				{ name: { contains: search, mode: "insensitive" } },
			];
		}

		// If role filter is provided, combine with SUPER_ADMIN exclusion using AND
		if (role) {
			where.AND = [
				{ role: { not: "SUPER_ADMIN" } },
				{ role: role },
			];
			// Remove the top-level role filter since we're using AND
			delete where.role;
		}

		const [users, total] = await Promise.all([
			prisma.user.findMany({
				where,
				skip,
				take: limit,
				orderBy: { createdAt: "desc" },
				select: {
					id: true,
					email: true,
					name: true,
					image: true,
					role: true,
					emailVerified: true,
					createdAt: true,
					updatedAt: true,
				},
			}),
			prisma.user.count({ where }),
		]);

		return { users: users as any, total, page, limit };
	} catch (error) {
		logger.error({ err: error, params }, "Error fetching users");
		throw new AppError("USERS_FETCH_ERROR", "Failed to fetch users", 500);
	}
};

export const getUserCount = async (): Promise<number> => {
	try {
		return await prisma.user.count();
	} catch (error) {
		logger.error({ err: error }, "Error counting users");
		throw new AppError("USER_COUNT_ERROR", "Failed to count users", 500);
	}
};

export const updateProfileImage = async (
	userId: string,
	imageUrl: string | null,
): Promise<User> => {
	try {
		return await prisma.user.update({
			where: { id: userId },
			data: { image: imageUrl },
		});
	} catch (error) {
		logger.error({ err: error, userId }, "Error updating profile image");
		throw new AppError(
			"IMAGE_UPDATE_ERROR",
			"Failed to update profile image",
			500,
		);
	}
};

export const getUserById = async (userId: string): Promise<User | null> => {
	try {
		return await prisma.user.findUnique({
			where: { id: userId },
		});
	} catch (error) {
		logger.error({ err: error, userId }, "Error fetching user by ID");
		throw new AppError("USER_FETCH_ERROR", "Failed to fetch user", 500);
	}
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
	try {
		return await prisma.user.findUnique({
			where: { email },
		});
	} catch (error) {
		logger.error({ err: error, email }, "Error fetching user by email");
		throw new AppError("USER_FETCH_ERROR", "Failed to fetch user", 500);
	}
};

export const createUser = async (data: CreateUserData): Promise<User> => {
	try {
		return await prisma.user.create({
			data: {
				email: data.email,
				name: data.name,
				password: data.password,
			image: data.image,
		},
	});
	} catch (error) {
		logger.error({ err: error, email: data.email }, "Error creating user");
		throw new AppError("USER_CREATE_ERROR", "Failed to create user", 500);
	}
};

export const adminCreateUser = async (data: {
	email: string;
	name: string;
	role: "USER" | "ADMIN" | "SUPER_ADMIN";
	password: string;
}): Promise<{ user: User; password: string }> => {
	try {
		const existingUser = await prisma.user.findUnique({
			where: { email: data.email },
		});

		if (existingUser) {
			throw new AppError("EMAIL_EXISTS", "A user with this email already exists", 400);
		}

		const hashedPassword = await hashPassword(data.password);

		const user = await prisma.$transaction(async (tx) => {
			const newUser = await tx.user.create({
				data: {
					email: data.email,
					name: data.name,
					role: data.role,
					emailVerified: true,
				},
			});

			await tx.account.create({
				data: {
					accountId: newUser.id,
					providerId: "credential",
					userId: newUser.id,
					password: hashedPassword,
				},
			});

			return newUser;
		});

		return {
			user,
			password: data.password,
		};
	} catch (error) {
		if (error instanceof AppError) throw error;
		logger.error({ err: error, email: data.email }, "Error creating user (admin)");
		throw new AppError("USER_CREATE_ERROR", "Failed to create user", 500);
	}
};

export const verifyUserEmail = async (userId: string): Promise<User> => {
	try {
		return await prisma.user.update({
			where: { id: userId },
			data: {
			emailVerified: true,
		},
	});
	} catch (error) {
		logger.error({ err: error, userId }, "Error verifying user email");
		throw new AppError("VERIFY_ERROR", "Failed to verify user email", 500);
	}
};

export const unverifyUserEmail = async (userId: string): Promise<User> => {
	try {
		return await prisma.user.update({
			where: { id: userId },
			data: {
			emailVerified: false,
		},
	});
	} catch (error) {
		logger.error({ err: error, userId }, "Error unverifying user email");
		throw new AppError("UNVERIFY_ERROR", "Failed to unverify user email", 500);
	}
};

export const updateUser = async (
	userId: string,
	data: UpdateUserData,
): Promise<User> => {
	try {
		return await prisma.user.update({
			where: { id: userId },
			data,
		});
	} catch (error) {
		logger.error({ err: error, userId }, "Error updating user");
		throw new AppError("USER_UPDATE_ERROR", "Failed to update user", 500);
	}
};

export const deleteUser = async (userId: string): Promise<void> => {
	try {
		await prisma.user.delete({
			where: { id: userId },
		});
	} catch (error) {
		logger.error({ err: error, userId }, "Error deleting user");
		throw new AppError("USER_DELETE_ERROR", "Failed to delete user", 500);
	}
};

export const isEmailTaken = async(
	email: string,
	excludeUserId?: string,
): Promise<boolean> => {
	try {
		const user = await prisma.user.findUnique({
			where: { email },
			select: { id: true },
		});

		if (!user) return false;
		if (excludeUserId && user.id === excludeUserId) return false;

		return true;
	} catch (error) {
		logger.error({ err: error, email }, "Error checking email");
		throw new AppError("EMAIL_CHECK_ERROR", "Failed to check email", 500);
	}
};

