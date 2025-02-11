import Table from '@/components/Table';
import { getPaginatedUsers } from '@/app/(dashboard)/users/actions';

/**
 * Este componente se renderiza en el servidor (Server Component).
 * Llama directamente a la Server Action.
 */
export default async function UsersPage({
	searchParams,
}: {
	searchParams?: { page?: string };
}) {
	// Tomamos la página desde query (por ejemplo, /users?page=2)
	const page = parseInt(searchParams?.page || '1', 10);
	const limit = 10;

	// Llamamos a la Server Action
	const { users, total, totalPages } = await getPaginatedUsers(page, limit);

	// Definimos las columnas de la tabla
	const columns = [
		{
			accessorKey: 'id',
			header: 'ID',
		},
		{
			accessorKey: 'name',
			header: 'Nombre',
		},
		{
			accessorKey: 'email',
			header: 'Email',
		},
	];

	return (
		<Table
			columns={columns}
			data={users}
			enablePagination
			initialPageSize={limit}
		/>
	);
}
