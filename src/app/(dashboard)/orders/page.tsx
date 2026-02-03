import { getPaginatedOrders } from '@/app/(dashboard)/orders/actions';
import { OrdersTable } from './orders-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Metadata } from 'next';
import { OrderStatus } from '@prisma/client';
import { Suspense } from 'react';
import OrdersFilter from './orders-filter';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';

export const metadata: Metadata = {
	title: 'Órdenes',
	description: 'Gestión de todas las órdenes',
};

type SortField = 'id' | 'totalPrice' | 'status' | 'createdAt';
type SortOrder = 'asc' | 'desc';

const VALID_SORT_FIELDS: SortField[] = ['id', 'totalPrice', 'status', 'createdAt'];
const VALID_SORT_ORDERS: SortOrder[] = ['asc', 'desc'];

export default async function OrdersPage({
	searchParams,
}: {
	searchParams?: Promise<{
		page?: string;
		status?: string;
		sortBy?: string;
		order?: string;
	}>;
}) {
	const params = await searchParams;
	const page = parseInt(params?.page || '1', 10);
	const status = (params?.status || 'ALL') as OrderStatus | 'ALL';
	const sortBy = VALID_SORT_FIELDS.includes(params?.sortBy as SortField)
		? (params?.sortBy as SortField)
		: 'createdAt';
	const order = VALID_SORT_ORDERS.includes(params?.order as SortOrder)
		? (params?.order as SortOrder)
		: 'desc';
	const limit = 10;

	// Get current user role
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	const dbUser = user
		? await prisma.user.findUnique({
				where: { id: user.id },
				select: { role: true },
		  })
		: null;

	const isAdmin = dbUser?.role === 'ADMIN';

	const { orders, totalPages } = await getPaginatedOrders(page, limit, status, sortBy, order);

	return (
		<div className="container mx-auto py-10">
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">Órdenes</CardTitle>
					<p className="text-sm text-muted-foreground mt-1">
						Gestiona todas las órdenes de la plataforma
					</p>
				</CardHeader>
				<CardContent>
					<Suspense fallback={<div>Cargando filtros...</div>}>
						<OrdersFilter currentStatus={status} />
					</Suspense>
					<div className="mt-6">
						<OrdersTable
							orders={orders}
							currentPage={page}
							totalPages={totalPages}
							isAdmin={isAdmin}
						/>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
