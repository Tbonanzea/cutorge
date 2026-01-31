'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Loader2, Plus, Trash2, Save } from 'lucide-react';
import Link from 'next/link';
import {
	getMaterialById,
	updateMaterial,
	createMaterialType,
	deleteMaterialType,
} from '../actions';
import { MaterialType } from '@prisma/client';

type MaterialWithTypes = Awaited<ReturnType<typeof getMaterialById>>;

export default function EditMaterialPage() {
	const params = useParams();
	const materialId = params.id as string;

	const [material, setMaterial] = useState<MaterialWithTypes | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showNewTypeForm, setShowNewTypeForm] = useState(false);

	useEffect(() => {
		async function fetchMaterial() {
			const result = await getMaterialById(materialId);
			setMaterial(result);
			setLoading(false);
		}
		fetchMaterial();
	}, [materialId]);

	const handleUpdateMaterial = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setSaving(true);
		setError(null);

		const formData = new FormData(e.currentTarget);
		const name = formData.get('name') as string;
		const description = formData.get('description') as string;

		const result = await updateMaterial(materialId, { name, description });

		if (result.success) {
			setMaterial((prev) =>
				prev ? { ...prev, name, description: description || null } : null
			);
		} else {
			setError(result.error || 'Error al actualizar');
		}
		setSaving(false);
	};

	const handleCreateType = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setSaving(true);
		setError(null);

		const formData = new FormData(e.currentTarget);
		const data = {
			width: parseFloat(formData.get('width') as string),
			length: parseFloat(formData.get('length') as string),
			height: parseFloat(formData.get('height') as string),
			pricePerUnit: parseFloat(formData.get('pricePerUnit') as string),
			massPerUnit: parseFloat(formData.get('massPerUnit') as string),
			stock: parseInt(formData.get('stock') as string),
			errorMargin: parseFloat(formData.get('errorMargin') as string),
			maxCutLength: parseFloat(formData.get('maxCutLength') as string),
			minCutLength: parseFloat(formData.get('minCutLength') as string),
			maxCutWidth: parseFloat(formData.get('maxCutWidth') as string),
			minCutWidth: parseFloat(formData.get('minCutWidth') as string),
		};

		const result = await createMaterialType(materialId, data);

		if (result.success && result.materialType) {
			setMaterial((prev) =>
				prev
					? {
							...prev,
							types: [...prev.types, result.materialType as MaterialType],
					  }
					: null
			);
			setShowNewTypeForm(false);
			(e.target as HTMLFormElement).reset();
		} else {
			setError(result.error || 'Error al crear tipo');
		}
		setSaving(false);
	};

	const handleDeleteType = async (typeId: string) => {
		if (!confirm('¿Eliminar este tipo de material?')) return;

		const result = await deleteMaterialType(typeId);
		if (result.success) {
			setMaterial((prev) =>
				prev
					? { ...prev, types: prev.types.filter((t) => t.id !== typeId) }
					: null
			);
		} else {
			alert(result.error);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="h-8 w-8 animate-spin text-gray-500" />
			</div>
		);
	}

	if (!material) {
		return (
			<div className="container mx-auto py-10">
				<Card>
					<CardContent className="py-10 text-center">
						<p className="text-red-600">Material no encontrado</p>
						<Button asChild variant="outline" className="mt-4">
							<Link href="/materials">Volver a materiales</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-10 space-y-6">
			<div className="flex items-center gap-4">
				<Button asChild variant="ghost" size="sm">
					<Link href="/materials">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Volver
					</Link>
				</Button>
				<h1 className="text-2xl font-bold">Editar Material</h1>
			</div>

			{error && (
				<div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
					{error}
				</div>
			)}

			{/* Material Info */}
			<Card>
				<CardHeader>
					<CardTitle>Información del Material</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleUpdateMaterial} className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="name">Nombre *</Label>
								<Input
									id="name"
									name="name"
									defaultValue={material.name}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="description">Descripción</Label>
								<Input
									id="description"
									name="description"
									defaultValue={material.description || ''}
								/>
							</div>
						</div>
						<div className="flex justify-end">
							<Button type="submit" disabled={saving}>
								{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								<Save className="mr-2 h-4 w-4" />
								Guardar Cambios
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>

			{/* Material Types */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<div>
						<CardTitle>Tipos de Material (Espesores)</CardTitle>
						<p className="text-sm text-gray-500 mt-1">
							Configura las dimensiones y precios disponibles
						</p>
					</div>
					<Button onClick={() => setShowNewTypeForm(!showNewTypeForm)}>
						<Plus className="mr-2 h-4 w-4" />
						Nuevo Tipo
					</Button>
				</CardHeader>
				<CardContent>
					{showNewTypeForm && (
						<form
							onSubmit={handleCreateType}
							className="p-4 bg-gray-50 rounded-lg mb-6"
						>
							<h4 className="font-medium mb-4">Nuevo Tipo de Material</h4>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								<div>
									<Label htmlFor="height">Espesor (mm) *</Label>
									<Input
										id="height"
										name="height"
										type="number"
										step="0.1"
										required
									/>
								</div>
								<div>
									<Label htmlFor="width">Ancho (mm) *</Label>
									<Input
										id="width"
										name="width"
										type="number"
										step="0.1"
										required
									/>
								</div>
								<div>
									<Label htmlFor="length">Largo (mm) *</Label>
									<Input
										id="length"
										name="length"
										type="number"
										step="0.1"
										required
									/>
								</div>
								<div>
									<Label htmlFor="pricePerUnit">Precio/Unidad ($) *</Label>
									<Input
										id="pricePerUnit"
										name="pricePerUnit"
										type="number"
										step="0.01"
										required
									/>
								</div>
								<div>
									<Label htmlFor="massPerUnit">Masa/Unidad (kg) *</Label>
									<Input
										id="massPerUnit"
										name="massPerUnit"
										type="number"
										step="0.01"
										required
									/>
								</div>
								<div>
									<Label htmlFor="stock">Stock *</Label>
									<Input id="stock" name="stock" type="number" required />
								</div>
								<div>
									<Label htmlFor="errorMargin">Margen Error (mm) *</Label>
									<Input
										id="errorMargin"
										name="errorMargin"
										type="number"
										step="0.1"
										required
									/>
								</div>
								<div>
									<Label htmlFor="minCutWidth">Corte Mín Ancho (mm) *</Label>
									<Input
										id="minCutWidth"
										name="minCutWidth"
										type="number"
										step="0.1"
										required
									/>
								</div>
								<div>
									<Label htmlFor="maxCutWidth">Corte Máx Ancho (mm) *</Label>
									<Input
										id="maxCutWidth"
										name="maxCutWidth"
										type="number"
										step="0.1"
										required
									/>
								</div>
								<div>
									<Label htmlFor="minCutLength">Corte Mín Largo (mm) *</Label>
									<Input
										id="minCutLength"
										name="minCutLength"
										type="number"
										step="0.1"
										required
									/>
								</div>
								<div>
									<Label htmlFor="maxCutLength">Corte Máx Largo (mm) *</Label>
									<Input
										id="maxCutLength"
										name="maxCutLength"
										type="number"
										step="0.1"
										required
									/>
								</div>
							</div>
							<div className="flex justify-end gap-2 mt-4">
								<Button
									type="button"
									variant="outline"
									onClick={() => setShowNewTypeForm(false)}
								>
									Cancelar
								</Button>
								<Button type="submit" disabled={saving}>
									{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
									Crear Tipo
								</Button>
							</div>
						</form>
					)}

					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Espesor</TableHead>
								<TableHead>Dimensiones</TableHead>
								<TableHead>Precio/Unidad</TableHead>
								<TableHead>Stock</TableHead>
								<TableHead>Límites de Corte</TableHead>
								<TableHead></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{material.types.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={6}
										className="text-center text-gray-500 py-8"
									>
										No hay tipos de material configurados
									</TableCell>
								</TableRow>
							) : (
								material.types.map((type) => (
									<TableRow key={type.id}>
										<TableCell className="font-medium">
											{type.height} mm
										</TableCell>
										<TableCell>
											{type.width} x {type.length} mm
										</TableCell>
										<TableCell>
											${type.pricePerUnit.toLocaleString('es-AR')}
										</TableCell>
										<TableCell>{type.stock} unidades</TableCell>
										<TableCell className="text-sm text-gray-500">
											Ancho: {type.minCutWidth}-{type.maxCutWidth}mm
											<br />
											Largo: {type.minCutLength}-{type.maxCutLength}mm
										</TableCell>
										<TableCell>
											<Button
												variant="destructive"
												size="sm"
												onClick={() => handleDeleteType(type.id)}
											>
												<Trash2 className="h-3 w-3" />
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
