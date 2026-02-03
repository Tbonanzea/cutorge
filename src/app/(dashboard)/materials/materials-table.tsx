'use client';

import { AdminDataTable, EditableColumnConfig } from '@/components/admin/AdminDataTable';
import { columns, MaterialWithTypes } from './columns';
import { updateMaterial, deleteMaterial } from './actions';

const editableColumns: EditableColumnConfig<MaterialWithTypes>[] = [
	{ accessorKey: 'name', type: 'text' },
	{ accessorKey: 'description', type: 'text' },
];

interface MaterialsTableProps {
	materials: MaterialWithTypes[];
	currentPage: number;
	totalPages: number;
	isAdmin: boolean;
}

export function MaterialsTable({
	materials,
	currentPage,
	totalPages,
	isAdmin,
}: MaterialsTableProps) {
	const handleSave = async (id: string, data: Partial<MaterialWithTypes>) => {
		return updateMaterial(id, {
			name: data.name,
			description: data.description ?? undefined,
		});
	};

	const handleDelete = async (id: string) => {
		return deleteMaterial(id);
	};

	const canDelete = (material: MaterialWithTypes) => {
		return material.types.length === 0 && material._count.cartItems === 0;
	};

	return (
		<AdminDataTable
			columns={columns}
			data={materials}
			currentPage={currentPage}
			totalPages={totalPages}
			baseUrl="/materials"
			idField="id"
			editableColumns={editableColumns}
			onSave={handleSave}
			onDelete={handleDelete}
			canDelete={canDelete}
			isAdmin={isAdmin}
			emptyMessage="No hay materiales registrados."
			serverSorting={true}
		/>
	);
}
