import { getExtraServices } from './actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Metadata } from 'next';
import { Plus } from 'lucide-react';
import { ExtraServiceActions } from './extra-actions';
import Link from 'next/link';

export const metadata: Metadata = {
	title: 'Extras',
	description: 'Gestión de servicios adicionales',
};

export default async function ExtrasPage() {
	const extras = await getExtraServices();

	const activeCount = extras.filter((e) => e.isActive).length;
	const totalRevenue = extras.reduce(
		(sum, e) => sum + e.price * e._count.orderExtras,
		0
	);

	return (
		<div className="container mx-auto py-10 space-y-6">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<div>
						<CardTitle className="text-2xl">Servicios Adicionales</CardTitle>
						<p className="text-sm text-muted-foreground mt-1">
							Gestiona los extras disponibles para las órdenes
						</p>
					</div>
					<Button asChild>
						<Link href="/extras/new">
							<Plus className="mr-2 h-4 w-4" />
							Nuevo Servicio
						</Link>
					</Button>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Nombre</TableHead>
								<TableHead>Descripción</TableHead>
								<TableHead className="text-right">Precio</TableHead>
								<TableHead>Unidad</TableHead>
								<TableHead className="text-center">Estado</TableHead>
								<TableHead className="text-center">Usos</TableHead>
								<TableHead className="text-right">Acciones</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{extras.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={7}
										className="text-center text-muted-foreground py-8"
									>
										No hay servicios adicionales configurados
									</TableCell>
								</TableRow>
							) : (
								extras.map((extra) => (
									<TableRow
										key={extra.id}
										className={!extra.isActive ? 'opacity-50' : ''}
									>
										<TableCell className="font-medium">{extra.name}</TableCell>
										<TableCell className="text-muted-foreground max-w-xs truncate">
											{extra.description || '-'}
										</TableCell>
										<TableCell className="text-right font-semibold">
											${extra.price.toLocaleString('es-AR')}
										</TableCell>
										<TableCell>
											<Badge variant="secondary">{extra.unit}</Badge>
										</TableCell>
										<TableCell className="text-center">
											<Badge
												variant={extra.isActive ? 'default' : 'outline'}
												className={
													extra.isActive
														? 'bg-green-100 text-green-800'
														: 'bg-muted text-muted-foreground'
												}
											>
												{extra.isActive ? 'Activo' : 'Inactivo'}
											</Badge>
										</TableCell>
										<TableCell className="text-center">
											{extra._count.orderExtras}
										</TableCell>
										<TableCell className="text-right">
											<ExtraServiceActions
												extraId={extra.id}
												extraName={extra.name}
												isActive={extra.isActive}
												hasOrders={extra._count.orderExtras > 0}
											/>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>

					<div className="mt-6 p-4 bg-muted rounded-lg">
						<h4 className="font-medium mb-2">Resumen</h4>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
							<div>
								<span className="text-muted-foreground">Total de servicios:</span>
								<p className="font-semibold">{extras.length}</p>
							</div>
							<div>
								<span className="text-muted-foreground">Servicios activos:</span>
								<p className="font-semibold">{activeCount}</p>
							</div>
							<div>
								<span className="text-muted-foreground">Precio promedio:</span>
								<p className="font-semibold">
									$
									{extras.length > 0
										? (
												extras.reduce((sum, e) => sum + e.price, 0) /
												extras.length
										  ).toLocaleString('es-AR', { maximumFractionDigits: 0 })
										: 0}
								</p>
							</div>
							<div>
								<span className="text-muted-foreground">Ingresos por extras:</span>
								<p className="font-semibold text-success">
									${totalRevenue.toLocaleString('es-AR')}
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
