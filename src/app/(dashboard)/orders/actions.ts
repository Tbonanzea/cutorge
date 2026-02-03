'use server';

import prisma from '@/lib/prisma';
import { OrderStatus, Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/permissions';

type SortField = 'id' | 'totalPrice' | 'status' | 'createdAt';
type SortOrder = 'asc' | 'desc';

// Type for order with all details
export type OrderWithDetails = Prisma.OrderGetPayload<{
	include: {
		user: {
			select: {
				id: true;
				email: true;
				firstName: true;
				lastName: true;
			};
		};
		items: {
			include: {
				file: true;
				materialType: {
					include: {
						material: true;
					};
				};
			};
		};
		extras: {
			include: {
				extraService: true;
			};
		};
		payments: true;
	};
}>;

/**
 * Get paginated orders with filters and sorting
 * @param page Page number (starts at 1)
 * @param limit Number of records per page
 * @param status Optional status filter
 * @param sortBy Field to sort by
 * @param order Sort direction
 */
export async function getPaginatedOrders(
	page = 1,
	limit = 10,
	status?: OrderStatus | 'ALL',
	sortBy: SortField = 'createdAt',
	order: SortOrder = 'desc'
) {
	const offset = (page - 1) * limit;

	// Build where clause
	const where: Prisma.OrderWhereInput = {};
	if (status && status !== 'ALL') {
		where.status = status;
	}

	// Build order by clause with stable tiebreaker
	const orderBy: Prisma.OrderOrderByWithRelationInput[] = [
		{ [sortBy]: order },
		{ id: 'asc' }, // Stable tiebreaker for duplicate values
	];

	// Fetch orders with pagination
	const [orders, total] = await Promise.all([
		prisma.order.findMany({
			where,
			skip: offset,
			take: limit,
			orderBy,
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
				extras: {
					include: {
						extraService: true,
					},
				},
				payments: {
					orderBy: { createdAt: 'desc' },
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
 * Update order status (admin only)
 * Valid transitions: PENDING → PAID → SHIPPED → COMPLETED
 * Can also mark as CANCELLED at any time
 */
export async function updateOrderStatus(
	orderId: string,
	newStatus: OrderStatus
) {
	try {
		// Require admin permission
		await requireAdmin();

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
