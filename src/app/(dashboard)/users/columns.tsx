'use client';

import { User } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<User>[] = [
	{
		accessorKey: 'id',
		header: 'ID',
	},
	{
		accessorKey: 'name',
		header: 'Nombre',
		cell: ({ row }) => {
			const firstName = row.original.firstName ?? '';
			const lastName = row.original.lastName ?? '';
			return `${firstName} ${lastName}`.trim();
		},
	},
	{
		accessorKey: 'email',
		header: 'Email',
	},
];
