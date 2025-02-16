'use server';

import prisma from '@/lib/prisma';
import { User } from '@prisma/client';

type CreateUserInput = Pick<User, 'id' | 'email'> &
	Partial<Omit<User, 'id' | 'email'>>;

/**
 * Retorna usuarios de forma paginada.
 * @param page Número de página (inicia en 1).
 * @param limit Cantidad de registros por página.
 */
export async function getPaginatedUsers(page = 1, limit = 10) {
	// Calculamos el offset (cuántos registros "saltar")
	const offset = (page - 1) * limit;

	// En Prisma, podemos hacer ambas consultas en paralelo con Promise.all
	const [users, total] = await Promise.all([
		prisma.user.findMany({
			skip: offset,
			take: limit,
			orderBy: { id: 'asc' },
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

// Server Action para obtener un usuario por email
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

// Server Action para crear un usuario
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

// Server Action para actualizar un usuario
export async function updateUser(id: string, updatedUser: Partial<User>) {
	try {
		if (!id) {
			throw new Error('ID is required');
		}

		const user = await prisma.user.update({
			where: { id },
			data: updatedUser,
		});

		if (!user) {
			throw new Error('User not found');
		}

		return { success: true, user };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}
