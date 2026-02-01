'use server';

import prisma from '@/lib/prisma';
import { OrderStatus, Prisma } from '@prisma/client';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// Type for order with all details (for user view)
export type MyOrderWithDetails = Prisma.OrderGetPayload<{
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
		shipments: {
			include: {
				items: true;
			};
		};
	};
}>;

/**
 * Get paginated orders for the current logged-in user
 * @param page Page number (starts at 1)
 * @param limit Number of records per page
 * @param status Optional status filter
 */
export async function getMyOrders(
	page = 1,
	limit = 10,
	status?: OrderStatus | 'ALL'
) {
	// Get current user from Supabase
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	if (!user) {
		redirect('/auth/login');
	}

	const offset = (page - 1) * limit;

	// Build where clause - always filter by userId
	const where: any = {
		userId: user.id,
	};

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
 * Get single order by ID for the current user
 * Validates that the order belongs to the logged-in user
 */
export async function getMyOrderById(orderId: string) {
	try {
		// Get current user from Supabase
		const supabase = await createClient();
		const { data: { user } } = await supabase.auth.getUser();

		if (!user) {
			return { success: false, error: 'Not authenticated' };
		}

		const order = await prisma.order.findFirst({
			where: {
				id: orderId,
				userId: user.id, // Ensure order belongs to this user
			},
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
				shipments: {
					orderBy: { shippedAt: 'desc' },
					include: {
						items: true,
					},
				},
			},
		});

		if (!order) {
			return { success: false, error: 'Order not found or access denied' };
		}

		return { success: true, order };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
}
