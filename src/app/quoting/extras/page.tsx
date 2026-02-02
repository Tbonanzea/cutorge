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
import { useQuoting } from '@/context/quotingContext';
import { useState, useEffect } from 'react';
import {
	useExtraServices,
	calculateExtrasTotal,
} from '@/hooks/useExtraServices';
import { Loader2 } from 'lucide-react';

export default function Extras() {
	const { cart, setExtras, validateCurrentStep, nextStep, prevStep } =
		useQuoting();

	const { data: extraServices = [], isLoading, error } = useExtraServices();

	const [selectedExtras, setSelectedExtras] = useState<string[]>(
		cart.extras || []
	);

	// Sync local state with context on mount
	useEffect(() => {
		setSelectedExtras(cart.extras || []);
	}, [cart.extras]);

	const handleExtraToggle = (extraId: string) => {
		const newExtras = selectedExtras.includes(extraId)
			? selectedExtras.filter((id) => id !== extraId)
			: [...selectedExtras, extraId];

		setSelectedExtras(newExtras);
		setExtras(newExtras);
	};

	const handleContinue = () => {
		if (validateCurrentStep()) {
			nextStep();
		}
	};

	const extrasTotal = calculateExtrasTotal(selectedExtras, extraServices);

	if (isLoading) {
		return (
			<div className='flex items-center justify-center py-20'>
				<Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
			</div>
		);
	}

	if (error) {
		return (
			<Card className='border-destructive/30 bg-destructive/10'>
				<CardContent className='py-10 text-center'>
					<p className='text-destructive'>
						Error al cargar los servicios adicionales
					</p>
					<Button
						variant='outline'
						className='mt-4'
						onClick={() => window.location.reload()}
					>
						Reintentar
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className='space-y-4 md:space-y-6'>
			<Card>
				<CardHeader className='pb-4'>
					<CardTitle className='text-lg md:text-xl'>
						Servicios Adicionales
					</CardTitle>
					<CardDescription className='text-sm'>
						Mejora tu proyecto con nuestros servicios extra. Todos son
						opcionales.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='space-y-3'>
						{extraServices.map((service) => {
							const isSelected = selectedExtras.includes(service.id);

							return (
								<div
									key={service.id}
									className={`p-3 md:p-4 border rounded-lg cursor-pointer transition-colors ${
										isSelected
											? 'border-primary bg-primary/10'
											: 'border-border hover:border-primary/50'
									}`}
									onClick={() => handleExtraToggle(service.id)}
								>
									<div className='flex flex-col md:flex-row md:items-start gap-3'>
										{/* Checkbox and main content */}
										<div className='flex items-start gap-3 flex-1 min-w-0'>
											<Checkbox
												checked={isSelected}
												onCheckedChange={() => handleExtraToggle(service.id)}
												className='mt-0.5 h-5 w-5'
												aria-label={service.name}
											/>
											<div className='flex-1 min-w-0'>
												<Label className='text-sm md:text-base font-medium cursor-pointer block'>
													{service.name}
												</Label>
												<p className='text-xs md:text-sm text-muted-foreground mt-1'>
													{service.description}
												</p>
											</div>
										</div>

										{/* Price - separate row on mobile */}
										<div className='flex justify-between md:flex-col md:text-right ml-8 md:ml-4'>
											<p className='font-semibold text-success text-base md:text-lg'>
												${service.price}
											</p>
											<p className='text-xs text-muted-foreground'>{service.unit}</p>
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
					<CardHeader className='pb-2'>
						<CardTitle className='text-base md:text-lg'>
							Servicios Seleccionados
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='space-y-2'>
							{selectedExtras.map((extraId) => {
								const service = extraServices.find((e) => e.id === extraId);
								if (!service) return null;

								return (
									<div
										key={extraId}
										className='flex justify-between items-center py-2 border-b border-border/50 last:border-b-0'
									>
										<div className='min-w-0 flex-1'>
											<span className='font-medium text-sm md:text-base'>
												{service.name}
											</span>
											<span className='text-xs md:text-sm text-muted-foreground ml-2'>
												({service.unit})
											</span>
										</div>
										<span className='font-semibold text-success shrink-0'>
											${service.price}
										</span>
									</div>
								);
							})}
							<div className='flex justify-between items-center pt-2 border-t border-border'>
								<span className='font-semibold text-sm md:text-base'>
									Total Extras:
								</span>
								<span className='font-bold text-success text-base md:text-lg'>
									${extrasTotal}
								</span>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{selectedExtras.length === 0 && (
				<Card className='border-dashed'>
					<CardContent className='flex flex-col items-center justify-center py-8 md:py-12'>
						<div className='text-center'>
							<h3 className='font-medium text-foreground mb-2 text-sm md:text-base'>
								Sin servicios adicionales
							</h3>
							<p className='text-xs md:text-sm text-muted-foreground'>
								No hay problema, puedes continuar con tu cotización básica.
							</p>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Información adicional */}
			<Card className='bg-info/10 border-info/30'>
				<CardContent className='pt-4 md:pt-6'>
					<h3 className='font-medium text-info-foreground mb-2 text-sm md:text-base'>
						Consejo
					</h3>
					<p className='text-xs md:text-sm text-info'>
						Los servicios adicionales pueden mejorar significativamente el
						resultado final de tu proyecto. Si tienes dudas sobre qué servicios
						podrían beneficiarte, no dudes en contactarnos.
					</p>
				</CardContent>
			</Card>

			{/* Navegación - responsive */}
			<div className='flex flex-col md:flex-row gap-3 md:justify-between'>
				<Button
					variant='outline'
					onClick={prevStep}
					className='w-full md:w-auto min-h-[44px]'
				>
					Volver
				</Button>
				<Button
					onClick={handleContinue}
					className='w-full md:w-auto min-h-[44px]'
				>
					{selectedExtras.length > 0
						? 'Continuar con Revisión'
						: 'Saltar Extras'}
				</Button>
			</div>
		</div>
	);
}
