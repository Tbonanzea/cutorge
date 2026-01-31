'use client';

import { Button } from '@/components/ui/button';
import { OrderStatus } from '@prisma/client';
import { useRouter, useSearchParams } from 'next/navigation';

interface OrdersFilterProps {
	currentStatus: OrderStatus | 'ALL';
}

const statusOptions: { value: OrderStatus | 'ALL'; label: string }[] = [
	{ value: 'ALL', label: 'Todas' },
	{ value: 'PENDING', label: 'Pendientes' },
	{ value: 'PAID', label: 'Pagadas' },
	{ value: 'SHIPPED', label: 'Enviadas' },
	{ value: 'COMPLETED', label: 'Completadas' },
	{ value: 'CANCELLED', label: 'Canceladas' },
];

export default function OrdersFilter({ currentStatus }: OrdersFilterProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const handleFilterChange = (newStatus: OrderStatus | 'ALL') => {
		const params = new URLSearchParams(searchParams.toString());
		if (newStatus === 'ALL') {
			params.delete('status');
		} else {
			params.set('status', newStatus);
		}
		params.delete('page'); // Reset to page 1 when filtering
		router.push(`/orders?${params.toString()}`);
	};

	return (
		<div className="flex gap-2 flex-wrap">
			{statusOptions.map((option) => (
				<Button
					key={option.value}
					variant={currentStatus === option.value ? 'default' : 'outline'}
					size="sm"
					onClick={() => handleFilterChange(option.value)}
				>
					{option.label}
				</Button>
			))}
		</div>
	);
}
