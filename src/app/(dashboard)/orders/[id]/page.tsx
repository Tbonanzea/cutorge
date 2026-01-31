'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getOrderById, updateOrderStatus, OrderWithDetails } from '../actions';
import { OrderStatus } from '@prisma/client';
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
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';

const statusColors: Record<OrderStatus, string> = {
	PENDING: 'bg-yellow-100 text-yellow-800',
	PAID: 'bg-blue-100 text-blue-800',
	SHIPPED: 'bg-purple-100 text-purple-800',
	COMPLETED: 'bg-green-100 text-green-800',
	CANCELLED: 'bg-red-100 text-red-800',
};

const statusLabels: Record<OrderStatus, string> = {
	PENDING: 'Pendiente',
	PAID: 'Pagado',
	SHIPPED: 'Enviado',
	COMPLETED: 'Completado',
	CANCELLED: 'Cancelado',
};

const nextStatusMap: Partial<Record<OrderStatus, OrderStatus>> = {
	PENDING: 'PAID',
	PAID: 'SHIPPED',
	SHIPPED: 'COMPLETED',
};

const nextStatusLabels: Record<string, string> = {
	PAID: 'Marcar como Pagado',
	SHIPPED: 'Marcar como Enviado',
	COMPLETED: 'Marcar como Completado',
};

export default function OrderDetailPage() {
	const params = useParams();
	const [order, setOrder] = useState<OrderWithDetails | null>(null);
	const [loading, setLoading] = useState(true);
	const [updating, setUpdating] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const orderId = params.id as string;

	useEffect(() => {
		async function fetchOrder() {
			const result = await getOrderById(orderId);
			if (result.success && result.order) {
				setOrder(result.order);
			} else {
				setError(result.error || 'Error al cargar la orden');
			}
			setLoading(false);
		}
		fetchOrder();
	}, [orderId]);

	const handleStatusChange = async (newStatus: OrderStatus) => {
		setUpdating(true);
		const result = await updateOrderStatus(orderId, newStatus);
		if (result.success && result.order) {
			setOrder((prev) => (prev ? { ...prev, status: result.order!.status } : null));
		} else {
			setError(result.error || 'Error al actualizar el estado');
		}
		setUpdating(false);
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="h-8 w-8 animate-spin text-gray-500" />
			</div>
		);
	}

	if (error || !order) {
		return (
			<div className="container mx-auto py-10">
				<Card>
					<CardContent className="py-10">
						<div className="text-center text-red-600">
							{error || 'Orden no encontrada'}
						</div>
						<div className="text-center mt-4">
							<Button asChild variant="outline">
								<Link href="/orders">
									<ArrowLeft className="mr-2 h-4 w-4" />
									Volver a órdenes
								</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	const nextStatus = nextStatusMap[order.status];
	const canCancel = order.status !== 'COMPLETED' && order.status !== 'CANCELLED';

	return (
		<div className="container mx-auto py-10 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button asChild variant="ghost" size="sm">
						<Link href="/orders">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Volver
						</Link>
					</Button>
					<h1 className="text-2xl font-bold">Orden #{order.id.slice(0, 8)}</h1>
					<Badge variant="secondary" className={statusColors[order.status]}>
						{statusLabels[order.status]}
					</Badge>
				</div>
				<div className="flex gap-2">
					{nextStatus && (
						<Button
							onClick={() => handleStatusChange(nextStatus)}
							disabled={updating}
						>
							{updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{nextStatusLabels[nextStatus]}
						</Button>
					)}
					{canCancel && (
						<Button
							variant="destructive"
							onClick={() => handleStatusChange('CANCELLED')}
							disabled={updating}
						>
							Cancelar Orden
						</Button>
					)}
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{/* Order Info */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Información de la Orden</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div>
							<span className="text-sm text-gray-500">ID completo</span>
							<p className="font-mono text-sm">{order.id}</p>
						</div>
						<div>
							<span className="text-sm text-gray-500">Fecha de creación</span>
							<p>
								{format(new Date(order.createdAt), "d 'de' MMMM, yyyy HH:mm", {
									locale: es,
								})}
							</p>
							<p className="text-xs text-gray-400">
								{formatDistanceToNow(new Date(order.createdAt), {
									addSuffix: true,
									locale: es,
								})}
							</p>
						</div>
						<div>
							<span className="text-sm text-gray-500">Última actualización</span>
							<p className="text-sm">
								{formatDistanceToNow(new Date(order.updatedAt), {
									addSuffix: true,
									locale: es,
								})}
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Customer Info */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Cliente</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div>
							<span className="text-sm text-gray-500">Nombre</span>
							<p className="font-medium">
								{order.user.firstName && order.user.lastName
									? `${order.user.firstName} ${order.user.lastName}`
									: 'Sin nombre'}
							</p>
						</div>
						<div>
							<span className="text-sm text-gray-500">Email</span>
							<p>{order.user.email}</p>
						</div>
						<Button asChild variant="outline" size="sm" className="w-full">
							<Link href={`/users?search=${order.user.email}`}>
								Ver perfil del cliente
							</Link>
						</Button>
					</CardContent>
				</Card>

				{/* Order Summary */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Resumen</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div>
							<span className="text-sm text-gray-500">Total de items</span>
							<p className="text-2xl font-bold">{order.items.length}</p>
						</div>
						<Separator />
						<div>
							<span className="text-sm text-gray-500">Total</span>
							<p className="text-3xl font-bold text-green-600">
								${order.totalPrice.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Order Items */}
			<Card>
				<CardHeader>
					<CardTitle>Items de la Orden</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Archivo</TableHead>
								<TableHead>Material</TableHead>
								<TableHead>Dimensiones</TableHead>
								<TableHead className="text-center">Cantidad</TableHead>
								<TableHead className="text-right">Precio Unit.</TableHead>
								<TableHead className="text-right">Subtotal</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{order.items.map((item) => (
								<TableRow key={item.id}>
									<TableCell>
										<div className="flex items-center gap-2">
											<span className="font-medium">{item.file.filename}</span>
											<Button
												asChild
												variant="ghost"
												size="sm"
												className="h-6 w-6 p-0"
											>
												<a
													href={item.file.filepath}
													target="_blank"
													rel="noopener noreferrer"
												>
													<ExternalLink className="h-3 w-3" />
												</a>
											</Button>
										</div>
									</TableCell>
									<TableCell>
										<div>
											<p className="font-medium">
												{item.materialType.material.name}
											</p>
											<p className="text-xs text-gray-500">
												{item.materialType.height}mm espesor
											</p>
										</div>
									</TableCell>
									<TableCell>
										<span className="text-sm">
											{item.materialType.width} x {item.materialType.length} mm
										</span>
									</TableCell>
									<TableCell className="text-center">{item.quantity}</TableCell>
									<TableCell className="text-right">
										${item.price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
									</TableCell>
									<TableCell className="text-right font-semibold">
										${(item.price * item.quantity).toLocaleString('es-AR', {
											minimumFractionDigits: 2,
										})}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>

					<Separator className="my-4" />

					<div className="flex justify-end">
						<div className="w-64 space-y-2">
							<div className="flex justify-between text-sm">
								<span className="text-gray-500">Subtotal</span>
								<span>
									${order.totalPrice.toLocaleString('es-AR', {
										minimumFractionDigits: 2,
									})}
								</span>
							</div>
							<Separator />
							<div className="flex justify-between font-bold text-lg">
								<span>Total</span>
								<span className="text-green-600">
									${order.totalPrice.toLocaleString('es-AR', {
										minimumFractionDigits: 2,
									})}
								</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
