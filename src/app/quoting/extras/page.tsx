'use client';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useQuoting, useStepValidation } from '@/context/quotingContext';
import { useState } from 'react';

const EXTRA_SERVICES = [
	{
		id: 'engraving',
		name: 'Grabado láser',
		description: 'Personaliza tu pieza con texto o diseños grabados',
		price: 15,
		unit: 'por pieza',
	},
	{
		id: 'painting',
		name: 'Pintura/Acabado',
		description: 'Aplicación de pintura o acabados especiales',
		price: 25,
		unit: 'por pieza',
	},
	{
		id: 'assembly',
		name: 'Ensamblaje',
		description: 'Armado de piezas múltiples',
		price: 50,
		unit: 'por proyecto',
	},
	{
		id: 'express',
		name: 'Entrega Express',
		description: 'Entrega en 24-48 horas',
		price: 100,
		unit: 'por pedido',
	},
	{
		id: 'packaging',
		name: 'Empaque Especial',
		description: 'Empaque personalizado para presentación',
		price: 20,
		unit: 'por pedido',
	},
	{
		id: 'design-review',
		name: 'Revisión de Diseño',
		description: 'Análisis y optimización del diseño para corte',
		price: 75,
		unit: 'por proyecto',
	},
];

export default function Extras() {
	const { data, updateData, nextStep, prevStep } = useQuoting();
	const { validateCurrentStep } = useStepValidation();

	const [selectedExtras, setSelectedExtras] = useState<string[]>(data.extras);

	const handleExtraToggle = (extraId: string) => {
		const newExtras = selectedExtras.includes(extraId)
			? selectedExtras.filter((id) => id !== extraId)
			: [...selectedExtras, extraId];

		setSelectedExtras(newExtras);
		updateData({ extras: newExtras });
	};

	const handleContinue = () => {
		if (validateCurrentStep()) {
			nextStep();
		}
	};

	const calculateExtrasTotal = () => {
		return selectedExtras.reduce((total, extraId) => {
			const extra = EXTRA_SERVICES.find((e) => e.id === extraId);
			return total + (extra?.price || 0);
		}, 0);
	};

	return (
		<div className='space-y-6'>
			<Card>
				<CardHeader>
					<CardTitle>Servicios Adicionales</CardTitle>
					<CardDescription>
						Mejora tu proyecto con nuestros servicios extra. Todos
						son opcionales.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='space-y-4'>
						{EXTRA_SERVICES.map((service) => {
							const isSelected = selectedExtras.includes(
								service.id
							);

							return (
								<div
									key={service.id}
									className={`p-4 border rounded-lg cursor-pointer transition-colors ${
										isSelected
											? 'border-blue-500 bg-blue-50'
											: 'border-gray-200 hover:border-gray-300'
									}`}
									onClick={() =>
										handleExtraToggle(service.id)
									}
								>
									<div className='flex items-start space-x-3'>
										<Checkbox
											checked={isSelected}
											onChange={() =>
												handleExtraToggle(service.id)
											}
											className='mt-1'
										/>
										<div className='flex-1'>
											<div className='flex justify-between items-start'>
												<div>
													<Label className='text-base font-medium cursor-pointer'>
														{service.name}
													</Label>
													<p className='text-sm text-gray-600 mt-1'>
														{service.description}
													</p>
												</div>
												<div className='text-right ml-4'>
													<p className='font-semibold text-green-600'>
														${service.price}
													</p>
													<p className='text-xs text-gray-500'>
														{service.unit}
													</p>
												</div>
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>

			{/* Resumen de extras seleccionados */}
			{selectedExtras.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Servicios Seleccionados</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='space-y-2'>
							{selectedExtras.map((extraId) => {
								const service = EXTRA_SERVICES.find(
									(e) => e.id === extraId
								);
								if (!service) return null;

								return (
									<div
										key={extraId}
										className='flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0'
									>
										<div>
											<span className='font-medium'>
												{service.name}
											</span>
											<span className='text-sm text-gray-500 ml-2'>
												({service.unit})
											</span>
										</div>
										<span className='font-semibold text-green-600'>
											${service.price}
										</span>
									</div>
								);
							})}
							<div className='flex justify-between items-center pt-2 border-t border-gray-200'>
								<span className='font-semibold'>
									Total Extras:
								</span>
								<span className='font-bold text-green-600 text-lg'>
									${calculateExtrasTotal()}
								</span>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{selectedExtras.length === 0 && (
				<Card className='border-dashed'>
					<CardContent className='flex flex-col items-center justify-center py-12'>
						<div className='text-center'>
							<h3 className='font-medium text-gray-900 mb-2'>
								Sin servicios adicionales
							</h3>
							<p className='text-sm text-gray-500'>
								No hay problema, puedes continuar con tu
								cotización básica.
							</p>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Información adicional */}
			<Card className='bg-blue-50 border-blue-200'>
				<CardContent className='pt-6'>
					<h3 className='font-medium text-blue-900 mb-2'>
						💡 Consejo
					</h3>
					<p className='text-sm text-blue-700'>
						Los servicios adicionales pueden mejorar
						significativamente el resultado final de tu proyecto. Si
						tienes dudas sobre qué servicios podrían beneficiarte,
						no dudes en contactarnos.
					</p>
				</CardContent>
			</Card>

			{/* Navegación */}
			<div className='flex justify-between'>
				<Button variant='outline' onClick={prevStep}>
					Volver
				</Button>
				<Button onClick={handleContinue}>
					{selectedExtras.length > 0
						? 'Continuar con Revisión'
						: 'Saltar Extras'}
				</Button>
			</div>
		</div>
	);
}
