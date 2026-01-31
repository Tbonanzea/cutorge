'use client';

import { useQuoting } from '@/context/quotingContext';
import { useSubmitQuote } from '@/hooks/useSubmitQuote';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, FileText, Plus, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Extra services (should match extras/page.tsx)
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

export default function ReviewPage() {
	const { cart, prevStep, goToStep } = useQuoting();
	const { mutate: submitQuote, isPending, error } = useSubmitQuote();

	// Calculate material subtotal
	const materialSubtotal = cart.items.reduce((total, item) => {
		if (item.materialType) {
			return total + item.materialType.pricePerUnit * item.quantity;
		}
		return total;
	}, 0);

	// Calculate extras total
	const extrasTotal = (cart.extras || []).reduce((total, extraId) => {
		const service = EXTRA_SERVICES.find((s) => s.id === extraId);
		return total + (service?.price || 0);
	}, 0);

	// Grand total
	const grandTotal = materialSubtotal + extrasTotal;

	// Total items count
	const totalItemsCount = cart.items.reduce(
		(sum, item) => sum + item.quantity,
		0
	);

	const canSubmit =
		cart.items.length > 0 &&
		cart.items.every(
			(item) =>
				item.file &&
				item.material &&
				item.materialType &&
				item.quantity > 0
		);

	const handleSubmit = () => {
		if (canSubmit && !isPending) {
			submitQuote();
		}
	};

	return (
		<div className='space-y-6'>
			{/* Header */}
			<Card>
				<CardHeader>
					<CardTitle>Revisión de Cotización</CardTitle>
					<CardDescription>
						Revisa todos los detalles antes de enviar tu cotización.
					</CardDescription>
				</CardHeader>
			</Card>

			{/* Files & Materials Summary */}
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<FileText className='h-5 w-5' />
						Archivos y Materiales
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='space-y-4'>
						{cart.items.map((item, idx) => (
							<div
								key={`${item.file.id}-${idx}`}
								className='p-4 border rounded-lg bg-slate-50'
							>
								<div className='flex items-start justify-between'>
									<div className='flex-1'>
										<div className='flex items-center gap-2 mb-2'>
											<CheckCircle2 className='h-4 w-4 text-green-600' />
											<h4 className='font-semibold'>
												{item.file.filename}
											</h4>
										</div>
										<div className='grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground'>
											<div>
												<span className='font-medium'>
													Material:
												</span>{' '}
												{item.material?.name || 'N/A'}
											</div>
											<div>
												<span className='font-medium'>
													Espesor:
												</span>{' '}
												{item.materialType?.height || 0}mm
											</div>
											<div>
												<span className='font-medium'>
													Cantidad:
												</span>{' '}
												{item.quantity}{' '}
												{item.quantity === 1
													? 'pieza'
													: 'piezas'}
											</div>
										</div>
									</div>
									<div className='text-right ml-4'>
										<p className='text-lg font-semibold text-green-600'>
											$
											{item.materialType
												? (
														item.materialType
															.pricePerUnit *
														item.quantity
												  ).toFixed(2)
												: '0.00'}
										</p>
										<p className='text-xs text-muted-foreground'>
											$
											{item.materialType?.pricePerUnit.toFixed(
												2
											) || '0.00'}{' '}
											× {item.quantity}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>

					<Separator className='my-4' />

					<div className='flex justify-between items-center'>
						<div>
							<p className='text-sm text-muted-foreground'>
								Total de archivos
							</p>
							<p className='text-lg font-semibold'>
								{cart.items.length} archivo
								{cart.items.length !== 1 && 's'}
							</p>
						</div>
						<div className='text-right'>
							<p className='text-sm text-muted-foreground'>
								Subtotal materiales
							</p>
							<p className='text-xl font-semibold text-green-600'>
								${materialSubtotal.toFixed(2)}
							</p>
						</div>
					</div>

					<div className='mt-4 flex justify-end'>
						<Button
							variant='outline'
							size='sm'
							onClick={() => goToStep('material-selection')}
						>
							Editar materiales
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Extras Summary */}
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<Plus className='h-5 w-5' />
						Servicios Adicionales
					</CardTitle>
				</CardHeader>
				<CardContent>
					{cart.extras && cart.extras.length > 0 ? (
						<>
							<div className='space-y-3'>
								{cart.extras.map((extraId) => {
									const service = EXTRA_SERVICES.find(
										(s) => s.id === extraId
									);
									if (!service) return null;

									return (
										<div
											key={extraId}
											className='flex justify-between items-center p-3 border rounded-md bg-blue-50'
										>
											<div>
												<p className='font-medium'>
													{service.name}
												</p>
												<p className='text-xs text-muted-foreground'>
													{service.description}
												</p>
											</div>
											<div className='text-right'>
												<p className='font-semibold text-green-600'>
													${service.price}
												</p>
												<p className='text-xs text-muted-foreground'>
													{service.unit}
												</p>
											</div>
										</div>
									);
								})}
							</div>

							<Separator className='my-4' />

							<div className='flex justify-between items-center'>
								<p className='text-sm text-muted-foreground'>
									Total extras
								</p>
								<p className='text-xl font-semibold text-green-600'>
									${extrasTotal.toFixed(2)}
								</p>
							</div>
						</>
					) : (
						<div className='text-center py-8 text-muted-foreground'>
							<p>No se seleccionaron servicios adicionales</p>
						</div>
					)}

					<div className='mt-4 flex justify-end'>
						<Button
							variant='outline'
							size='sm'
							onClick={() => goToStep('extras')}
						>
							{cart.extras && cart.extras.length > 0
								? 'Editar extras'
								: 'Agregar extras'}
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Grand Total */}
			<Card className='border-2 border-primary'>
				<CardContent className='pt-6'>
					<div className='space-y-4'>
						<div className='flex justify-between items-center text-lg'>
							<span className='text-muted-foreground'>
								Subtotal materiales
							</span>
							<span className='font-semibold'>
								${materialSubtotal.toFixed(2)}
							</span>
						</div>

						{extrasTotal > 0 && (
							<div className='flex justify-between items-center text-lg'>
								<span className='text-muted-foreground'>
									Servicios adicionales
								</span>
								<span className='font-semibold'>
									${extrasTotal.toFixed(2)}
								</span>
							</div>
						)}

						<Separator />

						<div className='flex justify-between items-center'>
							<div>
								<p className='text-2xl font-bold'>Total</p>
								<p className='text-sm text-muted-foreground'>
									{totalItemsCount} pieza
									{totalItemsCount !== 1 && 's'} · {cart.items.length}{' '}
									archivo{cart.items.length !== 1 && 's'}
								</p>
							</div>
							<p className='text-3xl font-bold text-green-600'>
								${grandTotal.toFixed(2)}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Actions */}
			<Card className='bg-slate-50'>
				<CardContent className='pt-6'>
					<div className='space-y-4'>
						{error && (
							<Alert variant='destructive'>
								<AlertDescription>
									Error al enviar cotización: {error.message}
								</AlertDescription>
							</Alert>
						)}

						<div className='flex items-start gap-3'>
							<Badge variant='outline' className='mt-1'>
								Nota
							</Badge>
							<p className='text-sm text-muted-foreground'>
								Esta es una cotización preliminar. El precio final
								puede variar según la complejidad del diseño y la
								disponibilidad de materiales. Nos pondremos en
								contacto contigo para confirmar los detalles.
							</p>
						</div>

						<Separator />

						<div className='flex justify-between gap-4'>
							<Button
								variant='outline'
								onClick={prevStep}
								disabled={isPending}
							>
								Volver
							</Button>
							<Button
								size='lg'
								disabled={!canSubmit || isPending}
								onClick={handleSubmit}
								className='min-w-[200px]'
							>
								{isPending ? (
									<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										Enviando...
									</>
								) : (
									'Enviar Cotización'
								)}
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
