'use server';

import prisma from '@/lib/prisma';
import { User, UserRole, Prisma } from '@/generated/prisma/client';
import { requireAdmin } from '@/lib/permissions';
import { revalidatePath } from 'next/cache';

type CreateUserInput = Pick<User, 'id' | 'email'> &
	Partial<Omit<User, 'id' | 'email'>>;

type SortField = 'id' | 'email' | 'firstName' | 'lastName' | 'role' | 'createdAt';
type SortOrder = 'asc' | 'desc';

/**
 * Get paginated users with optional sorting
 * @param page Page number (starts at 1)
 * @param limit Records per page
 * @param sortBy Field to sort by
 * @param order Sort direction
 */
export async function getPaginatedUsers(
	page = 1,
	limit = 10,
	sortBy: SortField = 'createdAt',
	order: SortOrder = 'desc'
) {
	const offset = (page - 1) * limit;

	// Use array for stable sorting with id as tiebreaker
	const orderBy: Prisma.UserOrderByWithRelationInput[] = [
		{ [sortBy]: order },
		{ id: 'asc' }, // Stable tiebreaker for duplicate values
	];

	const [users, total] = await Promise.all([
		prisma.user.findMany({
			skip: offset,
			take: limit,
			orderBy,
			include: {
				_count: {
					select: { orders: true },
				},
			},
		}),
		prisma.user.count(),
	]);

	return {
		users,
		page,
		limit,
		total,
		totalPages: Math.ceil(total / limit),
	};
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
	try {
		if (!email) {
			throw new Error('Email is required');
		}

		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (!user) {
			throw new Error('User not found');
		}

		return { success: true, user };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

/**
 * Create a new user
 */
export async function createUser(newUser: CreateUserInput) {
	try {
		if (!newUser.id || !newUser.email) {
			throw new Error('ID and email are required');
		}

		const user = await prisma.user.create({
			data: newUser,
		});

		if (!user) {
			throw new Error('User not found');
		}

		return { success: true, user };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

/**
 * Update a user by ID (admin only)
 */
export async function updateUserById(
	id: string,
	data: {
		firstName?: string;
		lastName?: string;
		role?: UserRole;
	}
) {
	try {
		// Require admin permission
		await requireAdmin();

		const user = await prisma.user.update({
			where: { id },
			data: {
				firstName: data.firstName,
				lastName: data.lastName,
				role: data.role,
			},
		});

		revalidatePath('/users');
		return { success: true, user };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

/**
 * Update a user by email
 */
export async function updateUser(email: string, updatedUser: Partial<User>) {
	try {
		// Require admin permission
		await requireAdmin();

		if (!email) {
			throw new Error('Email is required');
		}

		const user = await prisma.user.update({
			where: { email },
			data: updatedUser,
		});

		if (!user) {
			throw new Error('User not found');
		}

		revalidatePath('/users');
		return { success: true, user };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

/**
 * Delete a user (admin only)
 * Note: This should be used carefully due to foreign key constraints
 */
export async function deleteUser(id: string) {
	try {
		// Require admin permission
		await requireAdmin();

		// Check if user has orders
		const user = await prisma.user.findUnique({
			where: { id },
			include: {
				_count: {
					select: { orders: true, carts: true },
				},
			},
		});

		if (!user) {
			return { success: false, error: 'Usuario no encontrado' };
		}

		if (user._count.orders > 0) {
			return {
				success: false,
				error: 'No se puede eliminar: el usuario tiene órdenes asociadas',
			};
		}

		// Delete carts first
		await prisma.cart.deleteMany({
			where: { userId: id },
		});

		// Delete user
		await prisma.user.delete({
			where: { id },
		});

		revalidatePath('/users');
		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}
