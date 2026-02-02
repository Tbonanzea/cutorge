import type { VariantProps } from 'class-variance-authority';
import type { badgeVariants } from '@/components/ui/badge';

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

export type OrderStatus =
	| 'PENDING'
	| 'PAID'
	| 'SHIPPED'
	| 'COMPLETED'
	| 'CANCELLED';

export function getStatusVariant(status: string): BadgeVariant {
	const statusMap: Record<string, BadgeVariant> = {
		PENDING: 'pending',
		PAID: 'paid',
		SHIPPED: 'shipped',
		COMPLETED: 'completed',
		CANCELLED: 'cancelled',
	};
	return statusMap[status] || 'default';
}

export function getStatusLabel(status: string): string {
	const labelMap: Record<string, string> = {
		PENDING: 'Pendiente',
		PAID: 'Pagado',
		SHIPPED: 'Enviado',
		COMPLETED: 'Completado',
		CANCELLED: 'Cancelado',
	};
	return labelMap[status] || status;
}

export function getStatusIcon(status: string): string {
	const iconMap: Record<string, string> = {
		PENDING: 'Clock',
		PAID: 'CreditCard',
		SHIPPED: 'Truck',
		COMPLETED: 'CheckCircle',
		CANCELLED: 'XCircle',
	};
	return iconMap[status] || 'Circle';
}
