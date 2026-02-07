'use client';

import { User } from '@/generated/prisma/browser';
import { AdminDataTable, EditableColumnConfig } from '@/components/admin/AdminDataTable';
import { columns, roleOptions } from './columns';
import { updateUserById, deleteUser } from './actions';

type UserWithCount = User & {
	_count: {
		orders: number;
	};
};

const editableColumns: EditableColumnConfig<UserWithCount>[] = [
	{ accessorKey: 'firstName', type: 'text' },
	{ accessorKey: 'lastName', type: 'text' },
	{ accessorKey: 'role', type: 'select', options: roleOptions },
];

interface UsersTableProps {
	users: UserWithCount[];
	currentPage: number;
	totalPages: number;
	isAdmin: boolean;
}

export function UsersTable({ users, currentPage, totalPages, isAdmin }: UsersTableProps) {
	const handleSave = async (id: string, data: Partial<UserWithCount>) => {
		return updateUserById(id, {
			firstName: data.firstName ?? undefined,
			lastName: data.lastName ?? undefined,
			role: data.role,
		});
	};

	const handleDelete = async (id: string) => {
		return deleteUser(id);
	};

	const canDelete = (user: UserWithCount) => {
		return user._count.orders === 0;
	};

	return (
		<AdminDataTable
			columns={columns}
			data={users}
			currentPage={currentPage}
			totalPages={totalPages}
			baseUrl="/users"
			idField="id"
			editableColumns={editableColumns}
			onSave={handleSave}
			onDelete={handleDelete}
			canDelete={canDelete}
			isAdmin={isAdmin}
			emptyMessage="No hay usuarios registrados."
			serverSorting={true}
		/>
	);
}
