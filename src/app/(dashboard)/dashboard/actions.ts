'use server';

import prisma from '@/lib/prisma';

export interface DashboardMetrics {
	totalOrders: number;
	pendingOrders: number;
	paidOrders: number;
	completedOrders: number;
	totalRevenue: number;
	revenueThisMonth: number;
	totalUsers: number;
	newUsersThisMonth: number;
	recentOrders: {
		id: string;
		status: string;
		totalPrice: number;
		createdAt: Date;
		user: {
			email: string;
			firstName: string | null;
			lastName: string | null;
		};
	}[];
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
	const now = new Date();
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

	const [
		totalOrders,
		pendingOrders,
		paidOrders,
		completedOrders,
		totalRevenueResult,
		revenueThisMonthResult,
		totalUsers,
		newUsersThisMonth,
		recentOrders,
	] = await Promise.all([
		// Total orders
		prisma.order.count(),

		// Pending orders
		prisma.order.count({
			where: { status: 'PENDING' },
		}),

		// Paid orders
		prisma.order.count({
			where: { status: 'PAID' },
		}),

		// Completed orders
		prisma.order.count({
			where: { status: 'COMPLETED' },
		}),

		// Total revenue (from completed and paid orders)
		prisma.order.aggregate({
			_sum: { totalPrice: true },
			where: {
				status: { in: ['PAID', 'SHIPPED', 'COMPLETED'] },
			},
		}),

		// Revenue this month
		prisma.order.aggregate({
			_sum: { totalPrice: true },
			where: {
				status: { in: ['PAID', 'SHIPPED', 'COMPLETED'] },
				createdAt: { gte: startOfMonth },
			},
		}),

		// Total users
		prisma.user.count(),

		// New users this month
		prisma.user.count({
			where: { createdAt: { gte: startOfMonth } },
		}),

		// Recent orders
		prisma.order.findMany({
			take: 5,
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				status: true,
				totalPrice: true,
				createdAt: true,
				user: {
					select: {
						email: true,
						firstName: true,
						lastName: true,
					},
				},
			},
		}),
	]);

	return {
		totalOrders,
		pendingOrders,
		paidOrders,
		completedOrders,
		totalRevenue: totalRevenueResult._sum.totalPrice || 0,
		revenueThisMonth: revenueThisMonthResult._sum.totalPrice || 0,
		totalUsers,
		newUsersThisMonth,
		recentOrders,
	};
}
