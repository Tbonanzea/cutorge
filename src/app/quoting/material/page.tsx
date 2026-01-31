'use client';

import { useQuoting } from '@/context/quotingContext';
import { useMaterials } from '@/hooks/useMaterials';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Accordion } from '@/components/ui/accordion';
import MaterialSelectionCard from '@/components/MaterialSelectionCard';
import { Loader2, AlertCircle } from 'lucide-react';
import { useEffect } from 'react';

export default function MaterialSelectionPage() {
	const { cart, updateItem, validateCurrentStep, nextStep, prevStep } =
		useQuoting();
	const { data: materials, isLoading, error } = useMaterials();

	// Validate step whenever cart items change
	useEffect(() => {
		validateCurrentStep();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cart.items]);

	const handleMaterialChange = (cartIdx: number, materialId: string) => {
		const mat = materials?.find((m) => m.id === materialId);
		updateItem(cartIdx, {
			material: mat
				? {
						id: mat.id,
						name: mat.name,
						description: mat.description || '',
				  }
				: null,
			materialType: null, // Reset material type when material changes
		});
	};

	const handleMaterialTypeChange = (
		cartIdx: number,
		materialId: string,
		typeId: string
	) => {
		const mat = materials?.find((m) => m.id === materialId);
		const type = mat?.types.find((t) => t.id === typeId);
		updateItem(cartIdx, {
			materialType: type
				? {
						id: type.id,
						width: type.width,
						length: type.length,
						height: type.height,
						pricePerUnit: type.pricePerUnit,
						massPerUnit: type.massPerUnit,
						stock: type.stock,
						errorMargin: type.errorMargin,
						maxCutLength: type.maxCutLength,
						minCutLength: type.minCutLength,
						maxCutWidth: type.maxCutWidth,
						minCutWidth: type.minCutWidth,
				  }
				: null,
		});
	};

	const handleQuantityChange = (cartIdx: number, quantity: number) => {
		updateItem(cartIdx, { quantity });
	};

	const handleContinue = () => {
		if (validateCurrentStep()) {
			nextStep();
		}
	};

	const canProceed =
		cart.items.length > 0 &&
		cart.items.every(
			(item) => item.material && item.materialType && item.quantity > 0
		);

	if (isLoading) {
		return (
			<div className='flex items-center justify-center py-12'>
				<Loader2 className='h-8 w-8 animate-spin text-primary' />
				<span className='ml-3 text-muted-foreground'>
					Cargando materiales...
				</span>
			</div>
		);
	}

	if (error) {
		return (
			<Card className='border-destructive'>
				<CardHeader>
					<CardTitle className='text-destructive flex items-center gap-2'>
						<AlertCircle className='h-5 w-5' />
						Error al cargar materiales
					</CardTitle>
					<CardDescription>
						{error.message ||
							'No se pudieron cargar los materiales disponibles.'}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button variant='outline' onClick={() => window.location.reload()}>
						Reintentar
					</Button>
				</CardContent>
			</Card>
		);
	}

	if (!materials || materials.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>No hay materiales disponibles</CardTitle>
					<CardDescription>
						Por favor, contacta con soporte para más información.
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	if (cart.items.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>No hay archivos cargados</CardTitle>
					<CardDescription>
						Vuelve al paso anterior para cargar archivos DXF.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button onClick={prevStep}>Volver</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className='space-y-6'>
			<Card>
				<CardHeader>
					<CardTitle>Selección de Material</CardTitle>
					<CardDescription>
						Selecciona el material y espesor para cada archivo.
						Puedes ver una vista previa en 2D o 3D de cada diseño.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Accordion
						type='multiple'
						defaultValue={cart.items.map((_, idx) => `item-${idx}`)}
						className='w-full'
					>
						{cart.items.map((item, idx) => (
							<MaterialSelectionCard
								key={`${item.file.id}-${idx}`}
								item={item}
								index={idx}
								materials={materials}
								onMaterialChange={handleMaterialChange}
								onMaterialTypeChange={handleMaterialTypeChange}
								onQuantityChange={handleQuantityChange}
							/>
						))}
					</Accordion>
				</CardContent>
			</Card>

			{/* Summary Card */}
			<Card className='bg-slate-50'>
				<CardContent className='pt-6'>
					<div className='flex justify-between items-center'>
						<div>
							<p className='text-sm text-muted-foreground'>
								Archivos configurados
							</p>
							<p className='text-2xl font-semibold'>
								{
									cart.items.filter(
										(item) =>
											item.material && item.materialType
									).length
								}{' '}
								/ {cart.items.length}
							</p>
						</div>
						<div className='text-right'>
							<p className='text-sm text-muted-foreground'>
								Subtotal estimado
							</p>
							<p className='text-2xl font-semibold text-green-600'>
								$
								{cart.items
									.reduce((total, item) => {
										if (item.materialType) {
											return (
												total +
												item.materialType.pricePerUnit *
													item.quantity
											);
										}
										return total;
									}, 0)
									.toFixed(2)}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Navigation */}
			<div className='flex justify-between'>
				<Button variant='outline' onClick={prevStep}>
					Volver
				</Button>
				<Button onClick={handleContinue} disabled={!canProceed}>
					{canProceed
						? 'Continuar a Extras'
						: 'Completa todos los campos'}
				</Button>
			</div>
		</div>
	);
}
