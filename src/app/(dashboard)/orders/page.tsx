import { getPaginatedOrders } from '@/app/(dashboard)/orders/actions';
import { columns } from './columns';
import { DataTable } from '@/app/(dashboard)/users/data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderStatus } from '@prisma/client';
import { Suspense } from 'react';
import OrdersFilter from './orders-filter';

export default async function OrdersPage({
	searchParams,
}: {
	searchParams?: Promise<{ page?: string; status?: string }>;
}) {
	const params = await searchParams;
	const page = parseInt(params?.page || '1', 10);
	const status = (params?.status || 'ALL') as OrderStatus | 'ALL';
	const limit = 10;

	const { orders, totalPages } = await getPaginatedOrders(page, limit, status);

	return (
		<div className="container mx-auto py-10">
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">Órdenes</CardTitle>
				</CardHeader>
				<CardContent>
					<Suspense fallback={<div>Cargando filtros...</div>}>
						<OrdersFilter currentStatus={status} />
					</Suspense>
					<div className="mt-6">
						<DataTable
							columns={columns}
							data={orders}
							currentPage={page}
							totalPages={totalPages}
							baseUrl="/orders"
						/>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
