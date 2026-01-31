// page.tsx
import { getPaginatedUsers } from '@/app/(dashboard)/users/actions';
import { columns } from './columns';
import { DataTable } from './data-table';

export default async function UsersPage({
	searchParams,
}: {
	searchParams?: Promise<{ page?: string }>;
}) {
	const params = await searchParams;
	const page = parseInt(params?.page || '1', 10);
	const limit = 10;

	const { users, totalPages } = await getPaginatedUsers(page, limit);

	return (
		<div className='container mx-auto py-10'>
			<DataTable
				columns={columns}
				data={users}
				currentPage={page}
				totalPages={totalPages}
			/>
		</div>
	);
}
