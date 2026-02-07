'use client';

import { User, UserRole } from '@/generated/prisma/browser';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

type UserWithCount = User & {
	_count: {
		orders: number;
	};
};

export const columns: ColumnDef<UserWithCount>[] = [
	{
		accessorKey: 'email',
		header: 'Email',
		cell: ({ row }) => (
			<div className="font-medium">{row.original.email}</div>
		),
	},
	{
		accessorKey: 'firstName',
		header: 'Nombre',
		cell: ({ row }) => {
			const firstName = row.original.firstName ?? '';
			const lastName = row.original.lastName ?? '';
			const fullName = `${firstName} ${lastName}`.trim();
			return fullName || <span className="text-muted-foreground">-</span>;
		},
	},
	{
		accessorKey: 'role',
		header: 'Rol',
		cell: ({ row }) => {
			const role = row.original.role;
			return (
				<Badge variant={role === 'ADMIN' ? 'default' : 'secondary'}>
					{role === 'ADMIN' ? 'Admin' : 'Usuario'}
				</Badge>
			);
		},
	},
	{
		accessorKey: 'orders',
		header: 'Órdenes',
		cell: ({ row }) => (
			<div className="text-center">{row.original._count.orders}</div>
		),
	},
	{
		accessorKey: 'createdAt',
		header: 'Registrado',
		cell: ({ row }) => {
			const date = new Date(row.original.createdAt);
			return (
				<div className="text-sm text-muted-foreground">
					{formatDistanceToNow(date, { addSuffix: true, locale: es })}
				</div>
			);
		},
	},
];

export const roleOptions = [
	{ value: 'USER', label: 'Usuario' },
	{ value: 'ADMIN', label: 'Admin' },
];
