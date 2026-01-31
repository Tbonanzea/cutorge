import { getDashboardMetrics } from './actions';
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
import {
	ShoppingCart,
	DollarSign,
	Users,
	Clock,
	TrendingUp,
	CheckCircle,
	Package,
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const statusColors: Record<string, string> = {
	PENDING: 'bg-yellow-100 text-yellow-800',
	PAID: 'bg-blue-100 text-blue-800',
	SHIPPED: 'bg-purple-100 text-purple-800',
	COMPLETED: 'bg-green-100 text-green-800',
	CANCELLED: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
	PENDING: 'Pendiente',
	PAID: 'Pagado',
	SHIPPED: 'Enviado',
	COMPLETED: 'Completado',
	CANCELLED: 'Cancelado',
};

export default async function DashboardPage() {
	const metrics = await getDashboardMetrics();

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-bold">Dashboard</h1>
				<p className="text-gray-500 mt-1">
					Resumen general del negocio
				</p>
			</div>

			{/* Metrics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-gray-500">
							Órdenes Totales
						</CardTitle>
						<ShoppingCart className="h-4 w-4 text-gray-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{metrics.totalOrders}</div>
						<p className="text-xs text-gray-500 mt-1">
							{metrics.pendingOrders} pendientes
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-gray-500">
							Ingresos Totales
						</CardTitle>
						<DollarSign className="h-4 w-4 text-gray-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							${metrics.totalRevenue.toLocaleString('es-AR', {
								minimumFractionDigits: 2,
							})}
						</div>
						<p className="text-xs text-green-600 mt-1">
							+${metrics.revenueThisMonth.toLocaleString('es-AR', {
								minimumFractionDigits: 2,
							})}{' '}
							este mes
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-gray-500">
							Usuarios Registrados
						</CardTitle>
						<Users className="h-4 w-4 text-gray-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{metrics.totalUsers}</div>
						<p className="text-xs text-green-600 mt-1">
							+{metrics.newUsersThisMonth} este mes
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-gray-500">
							Órdenes Completadas
						</CardTitle>
						<CheckCircle className="h-4 w-4 text-gray-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{metrics.completedOrders}</div>
						<p className="text-xs text-gray-500 mt-1">
							{metrics.paidOrders} pagadas pendientes de envío
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Quick Stats */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card className="border-yellow-200 bg-yellow-50">
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-yellow-100 rounded-full">
								<Clock className="h-6 w-6 text-yellow-600" />
							</div>
							<div>
								<p className="text-sm text-yellow-600 font-medium">
									Pendientes de Pago
								</p>
								<p className="text-2xl font-bold text-yellow-700">
									{metrics.pendingOrders}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-blue-200 bg-blue-50">
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-blue-100 rounded-full">
								<Package className="h-6 w-6 text-blue-600" />
							</div>
							<div>
								<p className="text-sm text-blue-600 font-medium">
									Listas para Enviar
								</p>
								<p className="text-2xl font-bold text-blue-700">
									{metrics.paidOrders}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-green-200 bg-green-50">
					<CardContent className="pt-6">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-green-100 rounded-full">
								<TrendingUp className="h-6 w-6 text-green-600" />
							</div>
							<div>
								<p className="text-sm text-green-600 font-medium">
									Ingresos del Mes
								</p>
								<p className="text-2xl font-bold text-green-700">
									${metrics.revenueThisMonth.toLocaleString('es-AR', {
										minimumFractionDigits: 0,
									})}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Recent Orders */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>Órdenes Recientes</CardTitle>
					<Button asChild variant="outline" size="sm">
						<Link href="/orders">Ver todas</Link>
					</Button>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>ID</TableHead>
								<TableHead>Cliente</TableHead>
								<TableHead>Estado</TableHead>
								<TableHead className="text-right">Total</TableHead>
								<TableHead>Fecha</TableHead>
								<TableHead></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{metrics.recentOrders.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={6}
										className="text-center text-gray-500 py-8"
									>
										No hay órdenes aún
									</TableCell>
								</TableRow>
							) : (
								metrics.recentOrders.map((order) => (
									<TableRow key={order.id}>
										<TableCell>
											<code className="text-xs bg-gray-100 px-2 py-1 rounded">
												{order.id.slice(0, 8)}
											</code>
										</TableCell>
										<TableCell>
											{order.user.firstName && order.user.lastName
												? `${order.user.firstName} ${order.user.lastName}`
												: order.user.email}
										</TableCell>
										<TableCell>
											<Badge
												variant="secondary"
												className={statusColors[order.status]}
											>
												{statusLabels[order.status]}
											</Badge>
										</TableCell>
										<TableCell className="text-right font-semibold">
											${order.totalPrice.toLocaleString('es-AR', {
												minimumFractionDigits: 2,
											})}
										</TableCell>
										<TableCell className="text-gray-500 text-sm">
											{formatDistanceToNow(new Date(order.createdAt), {
												addSuffix: true,
												locale: es,
											})}
										</TableCell>
										<TableCell>
											<Button asChild variant="ghost" size="sm">
												<Link href={`/orders/${order.id}`}>Ver</Link>
											</Button>
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
