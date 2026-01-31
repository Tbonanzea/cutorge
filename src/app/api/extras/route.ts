import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/extras
 * Returns all active extra services
 */
export async function GET() {
	try {
		const extras = await prisma.extraService.findMany({
			where: { isActive: true },
			orderBy: { name: 'asc' },
			select: {
				id: true,
				name: true,
				description: true,
				price: true,
				unit: true,
				isActive: true,
			},
		});

		return NextResponse.json(extras);
	} catch (error: any) {
		console.error('Error fetching extra services:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch extra services' },
			{ status: 500 }
		);
	}
}
