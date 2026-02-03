import { getPaginatedMaterials } from './actions';
import { MaterialsTable } from './materials-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Metadata } from 'next';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';

export const metadata: Metadata = {
	title: 'Materiales',
	description: 'Gestión de materiales disponibles para corte',
};

type SortField = 'name' | 'createdAt';
type SortOrder = 'asc' | 'desc';

const VALID_SORT_FIELDS: SortField[] = ['name', 'createdAt'];
const VALID_SORT_ORDERS: SortOrder[] = ['asc', 'desc'];

export default async function MaterialsPage({
	searchParams,
}: {
	searchParams?: Promise<{ page?: string; sortBy?: string; order?: string }>;
}) {
	const params = await searchParams;
	const page = parseInt(params?.page || '1', 10);
	const sortBy = VALID_SORT_FIELDS.includes(params?.sortBy as SortField)
		? (params?.sortBy as SortField)
		: 'name';
	const order = VALID_SORT_ORDERS.includes(params?.order as SortOrder)
		? (params?.order as SortOrder)
		: 'asc';
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

	const { materials, totalPages } = await getPaginatedMaterials(
		page,
		limit,
		sortBy,
		order
	);

	return (
		<div className="container mx-auto py-10">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<div>
						<CardTitle className="text-2xl">Materiales</CardTitle>
						<p className="text-sm text-muted-foreground mt-1">
							Gestiona los materiales disponibles para corte
						</p>
					</div>
					{isAdmin && (
						<Button asChild>
							<Link href="/materials/new">
								<Plus className="mr-2 h-4 w-4" />
								Nuevo Material
							</Link>
						</Button>
					)}
				</CardHeader>
				<CardContent>
					<MaterialsTable
						materials={materials}
						currentPage={page}
						totalPages={totalPages}
						isAdmin={isAdmin}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
