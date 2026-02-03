import { getPaginatedUsers } from '@/app/(dashboard)/users/actions';
import { UsersTable } from './users-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';

export const metadata: Metadata = {
	title: 'Usuarios',
	description: 'Gestión de usuarios registrados',
};

type SortField = 'id' | 'email' | 'firstName' | 'lastName' | 'role' | 'createdAt';
type SortOrder = 'asc' | 'desc';

const VALID_SORT_FIELDS: SortField[] = ['id', 'email', 'firstName', 'lastName', 'role', 'createdAt'];
const VALID_SORT_ORDERS: SortOrder[] = ['asc', 'desc'];

export default async function UsersPage({
	searchParams,
}: {
	searchParams?: Promise<{ page?: string; sortBy?: string; order?: string }>;
}) {
	const params = await searchParams;
	const page = parseInt(params?.page || '1', 10);
	const sortBy = VALID_SORT_FIELDS.includes(params?.sortBy as SortField)
		? (params?.sortBy as SortField)
		: 'createdAt';
	const order = VALID_SORT_ORDERS.includes(params?.order as SortOrder)
		? (params?.order as SortOrder)
		: 'desc';
	const limit = 10;

	// Get current user role
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	const dbUser = user
		? await prisma.user.findUnique({
				where: { id: user.id },
				select: { role: true },
		  })
		: null;

	const isAdmin = dbUser?.role === 'ADMIN';

	const { users, totalPages } = await getPaginatedUsers(page, limit, sortBy, order);

	return (
		<div className="container mx-auto py-10">
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl">Usuarios</CardTitle>
					<p className="text-sm text-muted-foreground mt-1">
						Gestiona los usuarios registrados en la plataforma
					</p>
				</CardHeader>
				<CardContent>
					<UsersTable
						users={users}
						currentPage={page}
						totalPages={totalPages}
						isAdmin={isAdmin}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
