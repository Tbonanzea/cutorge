'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { deleteExtraService, toggleExtraServiceActive } from './actions';

interface ExtraServiceActionsProps {
	extraId: string;
	extraName: string;
	isActive: boolean;
	hasOrders: boolean;
}

export function ExtraServiceActions({
	extraId,
	extraName,
	isActive,
	hasOrders,
}: ExtraServiceActionsProps) {
	const [loading, setLoading] = useState(false);

	const handleToggle = async () => {
		setLoading(true);
		const result = await toggleExtraServiceActive(extraId);
		if (!result.success) {
			alert(result.error);
		}
		setLoading(false);
	};

	const handleDelete = async () => {
		if (
			!confirm(
				`¿Estás seguro de eliminar "${extraName}"? Esta acción no se puede deshacer.`
			)
		) {
			return;
		}

		setLoading(true);
		const result = await deleteExtraService(extraId);

		if (!result.success) {
			alert(result.error);
		}

		setLoading(false);
	};

	return (
		<div className="flex justify-end gap-2">
			<Button
				variant="ghost"
				size="sm"
				onClick={handleToggle}
				disabled={loading}
				title={isActive ? 'Desactivar' : 'Activar'}
			>
				{loading ? (
					<Loader2 className="h-4 w-4 animate-spin" />
				) : isActive ? (
					<ToggleRight className="h-4 w-4 text-success" />
				) : (
					<ToggleLeft className="h-4 w-4 text-gray-400" />
				)}
			</Button>
			<Button asChild variant="outline" size="sm">
				<Link href={`/extras/${extraId}`}>
					<Pencil className="h-3 w-3" />
				</Link>
			</Button>
			<Button
				variant="destructive"
				size="sm"
				onClick={handleDelete}
				disabled={loading || hasOrders}
				title={hasOrders ? 'No se puede eliminar: usado en órdenes' : 'Eliminar'}
			>
				{loading ? (
					<Loader2 className="h-3 w-3 animate-spin" />
				) : (
					<Trash2 className="h-3 w-3" />
				)}
			</Button>
		</div>
	);
}
