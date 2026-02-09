'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LockKeyhole } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';

export default function AccessPage() {
	const router = useRouter();
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setIsLoading(true);

		try {
			const response = await fetch('/api/access', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password }),
			});

			const data = await response.json();

			if (response.ok) {
				toast.success('Acceso concedido');
				router.push('/');
				router.refresh();
			} else {
				toast.error(data.error || 'Contraseña incorrecta');
				setPassword('');
			}
		} catch (error) {
			toast.error('Error al verificar la contraseña');
			console.error('Access error:', error);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className='fixed inset-0 z-50 bg-white dark:bg-slate-950 flex items-center justify-center px-4'>
			<div className='w-full max-w-md'>
				<div className='bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 p-8'>
					<div className='flex flex-col items-center mb-8'>
						<div className='w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mb-4'>
							<LockKeyhole className='w-8 h-8 text-primary' />
						</div>
						<h1 className='text-2xl font-bold text-slate-900 dark:text-white mb-2'>
							Acceso Restringido
						</h1>
						<p className='text-sm text-slate-600 dark:text-slate-400 text-center'>
							Ingresa la contraseña para acceder al sitio
						</p>
					</div>

					<form onSubmit={handleSubmit} className='space-y-4'>
						<div>
							<label
								htmlFor='password'
								className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5'
							>
								Contraseña
							</label>
							<Input
								id='password'
								type='password'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder='Ingresa la contraseña'
								disabled={isLoading}
								required
								autoFocus
								className='w-full'
							/>
						</div>

						<Button
							type='submit'
							disabled={isLoading || !password}
							className='w-full'
						>
							{isLoading ? 'Verificando...' : 'Acceder'}
						</Button>
					</form>
				</div>

				<p className='text-xs text-slate-500 dark:text-slate-500 text-center mt-6'>
					Este sitio está protegido temporalmente. Si necesitas acceso, contacta
					al administrador.
				</p>
			</div>
		</div>
	);
}
