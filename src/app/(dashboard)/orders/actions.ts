'use server';

import prisma from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

/**
 * Get paginated orders with filters
 * @param page Page number (starts at 1)
 * @param limit Number of records per page
 * @param status Optional status filter
 */
export async function getPaginatedOrders(
	page = 1,
	limit = 10,
	status?: OrderStatus | 'ALL'
) {
	const offset = (page - 1) * limit;

	// Build where clause
	const where: any = {};
	if (status && status !== 'ALL') {
		where.status = status;
	}

	// Fetch orders with pagination
	const [orders, total] = await Promise.all([
		prisma.order.findMany({
			where,
			skip: offset,
			take: limit,
			orderBy: { createdAt: 'desc' },
			include: {
				user: {
					select: {
						email: true,
						firstName: true,
						lastName: true,
					},
				},
				_count: {
					select: { items: true },
				},
			},
		}),
		prisma.order.count({ where }),
	]);

	return {
		orders,
		page,
		limit,
		total,
		totalPages: Math.ceil(total / limit),
	};
}

/**
 * Get single order by ID with all details
 */
export async function getOrderById(orderId: string) {
	try {
		const order = await prisma.order.findUnique({
			where: { id: orderId },
			include: {
				user: {
					select: {
						id: true,
						email: true,
						firstName: true,
						lastName: true,
					},
				},
				items: {
					include: {
						file: true,
						materialType: {
							include: {
								material: true,
							},
						},
					},
				},
			},
		});

		if (!order) {
			return { success: false, error: 'Order not found' };
		}

		return { success: true, order };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}

/**
 * Update order status
 * Valid transitions: PENDING → PAID → SHIPPED → COMPLETED
 * Can also mark as CANCELLED at any time
 */
export async function updateOrderStatus(
	orderId: string,
	newStatus: OrderStatus
) {
	try {
		// Validate order exists
		const existingOrder = await prisma.order.findUnique({
			where: { id: orderId },
			select: { status: true },
		});

		if (!existingOrder) {
			return { success: false, error: 'Order not found' };
		}

		// Validate status transition
		const validTransitions: Record<OrderStatus, OrderStatus[]> = {
			PENDING: ['PAID', 'CANCELLED'],
			PAID: ['SHIPPED', 'CANCELLED'],
			SHIPPED: ['COMPLETED', 'CANCELLED'],
			COMPLETED: [], // Final state
			CANCELLED: [], // Final state
		};

		const allowedNextStatuses = validTransitions[existingOrder.status];
		if (
			!allowedNextStatuses.includes(newStatus) &&
			existingOrder.status !== newStatus
		) {
			return {
				success: false,
				error: `Cannot transition from ${existingOrder.status} to ${newStatus}`,
			};
		}

		// Update order
		const updatedOrder = await prisma.order.update({
			where: { id: orderId },
			data: { status: newStatus },
		});

		// Revalidate pages
		revalidatePath('/orders');
		revalidatePath(`/orders/${orderId}`);

		return { success: true, order: updatedOrder };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}
