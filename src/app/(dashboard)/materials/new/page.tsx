'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createMaterial } from '../actions';

export default function NewMaterialPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		const formData = new FormData(e.currentTarget);
		const name = formData.get('name') as string;
		const description = formData.get('description') as string;

		const result = await createMaterial({ name, description });

		if (result.success) {
			router.push('/materials');
		} else {
			setError(result.error || 'Error al crear el material');
			setLoading(false);
		}
	};

	return (
		<div className="container mx-auto py-10 max-w-2xl">
			<div className="mb-6">
				<Button asChild variant="ghost" size="sm">
					<Link href="/materials">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Volver a materiales
					</Link>
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Nuevo Material</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-6">
						{error && (
							<div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
								{error}
							</div>
						)}

						<div className="space-y-2">
							<Label htmlFor="name">Nombre *</Label>
							<Input
								id="name"
								name="name"
								placeholder="Ej: Acero Inoxidable"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Descripción</Label>
							<Input
								id="description"
								name="description"
								placeholder="Descripción opcional del material"
							/>
						</div>

						<div className="flex justify-end gap-4">
							<Button type="button" variant="outline" asChild>
								<Link href="/materials">Cancelar</Link>
							</Button>
							<Button type="submit" disabled={loading}>
								{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Crear Material
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
