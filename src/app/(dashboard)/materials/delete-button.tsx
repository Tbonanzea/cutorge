'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteMaterial } from './actions';

interface DeleteMaterialButtonProps {
	materialId: string;
	materialName: string;
	disabled?: boolean;
}

export function DeleteMaterialButton({
	materialId,
	materialName,
	disabled,
}: DeleteMaterialButtonProps) {
	const [loading, setLoading] = useState(false);

	const handleDelete = async () => {
		if (
			!confirm(
				`¿Estás seguro de eliminar el material "${materialName}"? Esta acción no se puede deshacer.`
			)
		) {
			return;
		}

		setLoading(true);
		const result = await deleteMaterial(materialId);

		if (!result.success) {
			alert(result.error);
		}

		setLoading(false);
	};

	return (
		<Button
			variant="destructive"
			size="sm"
			onClick={handleDelete}
			disabled={disabled || loading}
		>
			{loading ? (
				<Loader2 className="h-3 w-3 animate-spin" />
			) : (
				<Trash2 className="h-3 w-3" />
			)}
		</Button>
	);
}
