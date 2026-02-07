'use client';

import { QuotingCartItem } from '@/context/quotingContext';
import { MaterialWithTypes } from '@/app/actions/materials';
import {
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import DXFViewerToggle from './DXFViewerToggle';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface MaterialSelectionCardProps {
	item: QuotingCartItem;
	index: number;
	materials: MaterialWithTypes[];
	onMaterialChange: (index: number, materialId: string) => void;
	onMaterialTypeChange: (
		index: number,
		materialId: string,
		typeId: string
	) => void;
	onQuantityChange: (index: number, quantity: number) => void;
}

export default function MaterialSelectionCard({
	item,
	index,
	materials,
	onMaterialChange,
	onMaterialTypeChange,
	onQuantityChange,
}: MaterialSelectionCardProps) {
	const isComplete = item.material && item.materialType && item.quantity > 0;
	const selectedMaterial = materials.find((m) => m.id === item.material?.id);

	return (
		<AccordionItem value={`item-${index}`} className='border rounded-lg mb-4'>
			<AccordionTrigger className='px-4 hover:no-underline hover:bg-muted/50'>
				<div className='flex items-center gap-3 w-full'>
					{isComplete ? (
						<CheckCircle2 className='h-5 w-5 text-success shrink-0' />
					) : (
						<AlertCircle className='h-5 w-5 text-warning shrink-0' />
					)}
					<div className='flex-1 text-left'>
						<p className='font-semibold'>{item.file.filename}</p>
						{item.material && item.materialType ? (
							<p className='text-sm text-muted-foreground'>
								{item.material.name} - {item.materialType.height}mm
								{item.quantity > 1 && ` × ${item.quantity}`}
							</p>
						) : (
							<p className='text-sm text-warning'>
								Selecciona material y espesor
							</p>
						)}
					</div>
				</div>
			</AccordionTrigger>
			<AccordionContent className='px-4'>
				<div className='grid grid-cols-1 lg:grid-cols-[40%_60%] gap-6 pt-4'>
					{/* Left: DXF Viewer (40%) */}
					<div className='flex flex-col'>
						<h4 className='text-sm font-medium mb-3'>Vista previa</h4>
						<DXFViewerToggle
							dxfUrl={item.file._blobUrl || item.file.filepath}
							className='w-full'
							thickness={item.materialType?.height}
						/>
					</div>

					{/* Right: Material Selectors (60%) */}
					<div className='flex flex-col gap-4'>
						<h4 className='text-sm font-medium mb-1'>
							Configuración de material
						</h4>

						{/* Material Selector */}
						<div className='space-y-2'>
							<Label htmlFor={`material-${index}`}>Material</Label>
							<select
								id={`material-${index}`}
								className='w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
								value={item.material?.id || ''}
								onChange={(e) =>
									onMaterialChange(index, e.target.value)
								}
							>
								<option value=''>Seleccionar material</option>
								{materials.map((mat) => (
									<option key={mat.id} value={mat.id}>
										{mat.name}
										{mat.description &&
											` - ${mat.description}`}
									</option>
								))}
							</select>
						</div>

						{/* Material Type Selector */}
						<div className='space-y-2'>
							<Label htmlFor={`material-type-${index}`}>
								Espesor / Tipo
							</Label>
							<select
								id={`material-type-${index}`}
								className='w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed'
								value={item.materialType?.id || ''}
								onChange={(e) =>
									onMaterialTypeChange(
										index,
										item.material?.id || '',
										e.target.value
									)
								}
								disabled={!item.material}
							>
								<option value=''>Seleccionar espesor</option>
								{selectedMaterial?.types.map((type) => (
									<option key={type.id} value={type.id}>
										{type.height}mm -{' '}
										{type.width}×{type.length}mm - $
										{type.pricePerUnit.toFixed(2)}/unidad
										{type.stock > 0
											? ` (${type.stock} en stock)`
											: ' (Sin stock)'}
									</option>
								))}
							</select>
						</div>

						{/* Quantity Input */}
						<div className='space-y-2'>
							<Label htmlFor={`quantity-${index}`}>
								Cantidad
							</Label>
							<Input
								id={`quantity-${index}`}
								type='number'
								min={1}
								value={item.quantity}
								onChange={(e) =>
									onQuantityChange(
										index,
										Number(e.target.value) || 1
									)
								}
								className='w-32'
							/>
						</div>

						{/* Price Preview */}
						{item.materialType && (
							<div className='mt-4 p-4 bg-muted/30 rounded-md border'>
								<div className='flex justify-between items-center'>
									<span className='text-sm text-muted-foreground'>
										Precio estimado:
									</span>
									<span className='text-lg font-semibold text-success'>
										$
										{(
											item.materialType.pricePerUnit *
											item.quantity
										).toFixed(2)}
									</span>
								</div>
								<p className='text-xs text-muted-foreground mt-2'>
									$
									{item.materialType.pricePerUnit.toFixed(2)}{' '}
									× {item.quantity} pieza(s)
								</p>
							</div>
						)}
					</div>
				</div>
			</AccordionContent>
		</AccordionItem>
	);
}
