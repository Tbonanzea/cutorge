'use client';

import { Material, MaterialType } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Eye } from 'lucide-react';

export type MaterialWithTypes = Material & {
	types: MaterialType[];
	_count: {
		cartItems: number;
	};
};

export const columns: ColumnDef<MaterialWithTypes>[] = [
	{
		accessorKey: 'name',
		header: 'Nombre',
		cell: ({ row }) => (
			<div className="font-medium">{row.original.name}</div>
		),
	},
	{
		accessorKey: 'description',
		header: 'Descripción',
		cell: ({ row }) => (
			<div className="text-muted-foreground max-w-xs truncate">
				{row.original.description || '-'}
			</div>
		),
	},
	{
		accessorKey: 'types',
		header: 'Tipos',
		cell: ({ row }) => (
			<Badge variant="secondary">
				{row.original.types.length} tipo
				{row.original.types.length !== 1 ? 's' : ''}
			</Badge>
		),
	},
	{
		accessorKey: 'cartItems',
		header: 'En Carritos',
		cell: ({ row }) => (
			<div className="text-center">{row.original._count.cartItems}</div>
		),
	},
	{
		id: 'view',
		header: 'Ver',
		cell: ({ row }) => (
			<Button asChild variant="outline" size="sm">
				<Link href={`/materials/${row.original.id}`}>
					<Eye className="h-4 w-4 mr-1" />
					Detalle
				</Link>
			</Button>
		),
	},
];
