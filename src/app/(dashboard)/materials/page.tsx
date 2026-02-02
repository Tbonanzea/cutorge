import { getMaterials } from './actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Metadata } from 'next';
import { Plus, Pencil } from 'lucide-react';
import Link from 'next/link';
import { DeleteMaterialButton } from './delete-button';

export const metadata: Metadata = {
	title: 'Materiales',
	description: 'Gestión de materiales disponibles para corte',
};

export default async function MaterialsPage() {
	const materials = await getMaterials();

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
					<Button asChild>
						<Link href="/materials/new">
							<Plus className="mr-2 h-4 w-4" />
							Nuevo Material
						</Link>
					</Button>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Nombre</TableHead>
								<TableHead>Descripción</TableHead>
								<TableHead className="text-center">Tipos</TableHead>
								<TableHead className="text-center">En Carritos</TableHead>
								<TableHead className="text-right">Acciones</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{materials.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={5}
										className="text-center text-muted-foreground py-8"
									>
										No hay materiales registrados
									</TableCell>
								</TableRow>
							) : (
								materials.map((material) => (
									<TableRow key={material.id}>
										<TableCell className="font-medium">
											{material.name}
										</TableCell>
										<TableCell className="text-muted-foreground">
											{material.description || '-'}
										</TableCell>
										<TableCell className="text-center">
											<Badge variant="secondary">
												{material.types.length} tipo
												{material.types.length !== 1 ? 's' : ''}
											</Badge>
										</TableCell>
										<TableCell className="text-center">
											{material._count.cartItems}
										</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end gap-2">
												<Button asChild variant="outline" size="sm">
													<Link href={`/materials/${material.id}`}>
														<Pencil className="mr-2 h-3 w-3" />
														Editar
													</Link>
												</Button>
												<DeleteMaterialButton
													materialId={material.id}
													materialName={material.name}
													disabled={
														material.types.length > 0 ||
														material._count.cartItems > 0
													}
												/>
											</div>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
