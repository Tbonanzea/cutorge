'use client';

import { Order, OrderStatus, User } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

type OrderWithUser = Order & {
	user: Pick<User, 'email' | 'firstName' | 'lastName'>;
	_count: {
		items: number;
	};
};

const statusColors: Record<OrderStatus, string> = {
	PENDING: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
	PAID: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
	SHIPPED: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
	COMPLETED: 'bg-green-100 text-green-800 hover:bg-green-100',
	CANCELLED: 'bg-red-100 text-red-800 hover:bg-red-100',
};

const statusLabels: Record<OrderStatus, string> = {
	PENDING: 'Pendiente',
	PAID: 'Pagado',
	SHIPPED: 'Enviado',
	COMPLETED: 'Completado',
	CANCELLED: 'Cancelado',
};

export const columns: ColumnDef<OrderWithUser>[] = [
	{
		accessorKey: 'id',
		header: 'ID',
		cell: ({ row }) => {
			const id = row.original.id;
			return (
				<code className="text-xs bg-gray-100 px-2 py-1 rounded">
					{id.slice(0, 8)}...
				</code>
			);
		},
	},
	{
		accessorKey: 'user',
		header: 'Cliente',
		cell: ({ row }) => {
			const user = row.original.user;
			const name =
				user.firstName && user.lastName
					? `${user.firstName} ${user.lastName}`
					: user.email;
			return <div className="font-medium">{name}</div>;
		},
	},
	{
		accessorKey: 'items',
		header: 'Items',
		cell: ({ row }) => {
			const count = row.original._count.items;
			return <div className="text-center">{count}</div>;
		},
	},
	{
		accessorKey: 'totalPrice',
		header: 'Total',
		cell: ({ row }) => {
			const price = row.original.totalPrice;
			return (
				<div className="font-semibold">
					${price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
				</div>
			);
		},
	},
	{
		accessorKey: 'status',
		header: 'Estado',
		cell: ({ row }) => {
			const status = row.original.status;
			return (
				<Badge variant="secondary" className={statusColors[status]}>
					{statusLabels[status]}
				</Badge>
			);
		},
	},
	{
		accessorKey: 'createdAt',
		header: 'Creado',
		cell: ({ row }) => {
			const date = new Date(row.original.createdAt);
			return (
				<div className="text-sm text-gray-600">
					{formatDistanceToNow(date, { addSuffix: true, locale: es })}
				</div>
			);
		},
	},
	{
		id: 'actions',
		header: 'Acciones',
		cell: ({ row }) => {
			const id = row.original.id;
			return (
				<Button asChild variant="outline" size="sm">
					<Link href={`/orders/${id}`}>Ver detalle</Link>
				</Button>
			);
		},
	},
];
