import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const CreateTransferSchema = z.object({
	orderId: z.string().uuid(),
});

/**
 * POST /api/payments/create-transfer
 * Creates a bank transfer payment record for an order
 */
export async function POST(request: NextRequest) {
	try {
		// Authenticate user
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Validate request body
		const body = await request.json();
		const { orderId } = CreateTransferSchema.parse(body);

		// Fetch order
		const order = await prisma.order.findUnique({
			where: { id: orderId },
			include: {
				payments: {
					where: {
						status: 'PENDING',
						paymentMethod: 'TRANSFER',
					},
				},
			},
		});

		if (!order) {
			return NextResponse.json({ error: 'Order not found' }, { status: 404 });
		}

		// Verify user owns this order
		if (order.userId !== user.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
		}

		// Verify order is in PENDING status
		if (order.status !== 'PENDING') {
			return NextResponse.json(
				{ error: 'Order is not pending payment' },
				{ status: 400 }
			);
		}

		// Check if there's already a pending transfer payment
		const existingPayment = order.payments[0];

		if (existingPayment) {
			return NextResponse.json({
				paymentId: existingPayment.id,
				message: 'Transfer payment already exists',
			});
		}

		// Create Payment record for bank transfer
		const payment = await prisma.payment.create({
			data: {
				orderId: order.id,
				paymentMethod: 'TRANSFER',
				status: 'PENDING',
				amount: order.totalPrice,
			},
		});

		return NextResponse.json({
			paymentId: payment.id,
			message: 'Transfer payment created, awaiting confirmation',
		});
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Validation error', details: error.errors },
				{ status: 400 }
			);
		}

		console.error('Error creating transfer payment:', error);
		return NextResponse.json(
			{ error: 'Failed to create transfer payment' },
			{ status: 500 }
		);
	}
}
