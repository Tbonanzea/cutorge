'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export type ExtraServiceWithStats = Awaited<ReturnType<typeof getExtraServices>>[number];

/**
 * Get all extra services
 */
export async function getExtraServices() {
	return prisma.extraService.findMany({
		orderBy: { name: 'asc' },
		include: {
			_count: {
				select: { orderExtras: true },
			},
		},
	});
}

/**
 * Get active extra services (for quoting flow)
 */
export async function getActiveExtraServices() {
	return prisma.extraService.findMany({
		where: { isActive: true },
		orderBy: { name: 'asc' },
	});
}

/**
 * Get extra service by ID
 */
export async function getExtraServiceById(id: string) {
	return prisma.extraService.findUnique({
		where: { id },
	});
}

/**
 * Create a new extra service
 */
export async function createExtraService(data: {
	name: string;
	description?: string;
	price: number;
	unit: string;
	isActive?: boolean;
}) {
	try {
		const extra = await prisma.extraService.create({
			data: {
				name: data.name,
				description: data.description || null,
				price: data.price,
				unit: data.unit,
				isActive: data.isActive ?? true,
			},
		});

		revalidatePath('/extras');
		return { success: true, extra };
	} catch (error: any) {
		if (error.code === 'P2002') {
			return { success: false, error: 'Ya existe un servicio con ese nombre' };
		}
		return { success: false, error: error.message };
	}
}

/**
 * Update an extra service
 */
export async function updateExtraService(
	id: string,
	data: {
		name?: string;
		description?: string;
		price?: number;
		unit?: string;
		isActive?: boolean;
	}
) {
	try {
		const extra = await prisma.extraService.update({
			where: { id },
			data,
		});

		revalidatePath('/extras');
		return { success: true, extra };
	} catch (error: any) {
		if (error.code === 'P2002') {
			return { success: false, error: 'Ya existe un servicio con ese nombre' };
		}
		return { success: false, error: error.message };
	}
}

/**
 * Delete an extra service
 */
export async function deleteExtraService(id: string) {
	try {
		// Check if service is being used in orders
		const extra = await prisma.extraService.findUnique({
			where: { id },
			include: {
				_count: {
					select: { orderExtras: true },
				},
			},
		});

		if (!extra) {
			return { success: false, error: 'Servicio no encontrado' };
		}

		if (extra._count.orderExtras > 0) {
			return {
				success: false,
				error: 'No se puede eliminar: está siendo usado en órdenes. Considera desactivarlo en su lugar.',
			};
		}

		await prisma.extraService.delete({
			where: { id },
		});

		revalidatePath('/extras');
		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

/**
 * Toggle extra service active status
 */
export async function toggleExtraServiceActive(id: string) {
	try {
		const extra = await prisma.extraService.findUnique({
			where: { id },
		});

		if (!extra) {
			return { success: false, error: 'Servicio no encontrado' };
		}

		const updated = await prisma.extraService.update({
			where: { id },
			data: { isActive: !extra.isActive },
		});

		revalidatePath('/extras');
		return { success: true, extra: updated };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

/**
 * Calculate total price of selected extras by IDs
 */
export async function calculateExtrasTotal(extraIds: string[]): Promise<number> {
	if (extraIds.length === 0) return 0;

	const extras = await prisma.extraService.findMany({
		where: { id: { in: extraIds } },
		select: { price: true },
	});

	return extras.reduce((total, extra) => total + extra.price, 0);
}
