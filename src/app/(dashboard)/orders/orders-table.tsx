'use client';

import { OrderStatus } from '@/generated/prisma/browser';
import { AdminDataTable, EditableColumnConfig } from '@/components/admin/AdminDataTable';
import { columns, statusOptions, OrderWithUser } from './columns';
import { updateOrderStatus } from './actions';

const editableColumns: EditableColumnConfig<OrderWithUser>[] = [
	{ accessorKey: 'status', type: 'select', options: statusOptions },
];

interface OrdersTableProps {
	orders: OrderWithUser[];
	currentPage: number;
	totalPages: number;
	isAdmin: boolean;
}

export function OrdersTable({ orders, currentPage, totalPages, isAdmin }: OrdersTableProps) {
	const handleSave = async (id: string, data: Partial<OrderWithUser>) => {
		if (data.status) {
			return updateOrderStatus(id, data.status as OrderStatus);
		}
		return { success: false, error: 'No se proporcionó un estado válido' };
	};

	return (
		<AdminDataTable
			columns={columns}
			data={orders}
			currentPage={currentPage}
			totalPages={totalPages}
			baseUrl="/orders"
			idField="id"
			editableColumns={editableColumns}
			onSave={handleSave}
			isAdmin={isAdmin}
			emptyMessage="No hay órdenes registradas."
			serverSorting={true}
		/>
	);
}
