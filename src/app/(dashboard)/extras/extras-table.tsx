'use client';

import { AdminDataTable, EditableColumnConfig } from '@/components/admin/AdminDataTable';
import { columns, unitOptions, ExtraServiceWithStats } from './columns';
import { updateExtraService, deleteExtraService } from './actions';

const activeOptions = [
	{ value: 'true', label: 'Activo' },
	{ value: 'false', label: 'Inactivo' },
];

const editableColumns: EditableColumnConfig<ExtraServiceWithStats>[] = [
	{ accessorKey: 'name', type: 'text' },
	{ accessorKey: 'description', type: 'text' },
	{ accessorKey: 'price', type: 'number' },
	{ accessorKey: 'unit', type: 'select', options: unitOptions },
	{ accessorKey: 'isActive', type: 'select', options: activeOptions },
];

interface ExtrasTableProps {
	extras: ExtraServiceWithStats[];
	currentPage: number;
	totalPages: number;
	isAdmin: boolean;
}

export function ExtrasTable({
	extras,
	currentPage,
	totalPages,
	isAdmin,
}: ExtrasTableProps) {
	const handleSave = async (id: string, data: Partial<ExtraServiceWithStats>) => {
		return updateExtraService(id, {
			name: data.name,
			description: data.description ?? undefined,
			price: data.price,
			unit: data.unit,
			isActive: typeof data.isActive === 'string' ? data.isActive === 'true' : data.isActive === true,
		});
	};

	const handleDelete = async (id: string) => {
		return deleteExtraService(id);
	};

	const canDelete = (extra: ExtraServiceWithStats) => {
		return extra._count.orderExtras === 0;
	};

	return (
		<AdminDataTable
			columns={columns}
			data={extras}
			currentPage={currentPage}
			totalPages={totalPages}
			baseUrl="/extras"
			idField="id"
			editableColumns={editableColumns}
			onSave={handleSave}
			onDelete={handleDelete}
			canDelete={canDelete}
			isAdmin={isAdmin}
			emptyMessage="No hay servicios adicionales registrados."
			serverSorting={true}
		/>
	);
}
