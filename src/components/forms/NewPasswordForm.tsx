'use client';

import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useNewPasswordMutation } from '@/hooks/auth/useNewPasswordMutation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import LoadingSpinner from '../LoadingSpinner';

const formSchema = z
	.object({
		newPassword: z
			.string()
			.min(6, {
				message: 'La contraseña debe tener al menos 6 caracteres',
			}),
		repeatPassword: z.string(),
	})
	.refine((data) => data.newPassword === data.repeatPassword, {
		message: 'Las contraseñas no coinciden',
		path: ['repeatPassword'],
	});

export default function NewPasswordForm({
	emailRedirectTo,
}: {
	emailRedirectTo: string;
}) {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			newPassword: '',
			repeatPassword: '',
		},
	});

	const {
		mutate: newPassword,
		isPending,
		isError,
		isSuccess,
		error,
	} = useNewPasswordMutation();

	const onSubmit = (data: z.infer<typeof formSchema>) => {
		newPassword({ newPassword: data.newPassword, emailRedirectTo });
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className='space-y-4 max-w-sm'
			>
				<FormField
					control={form.control}
					name='newPassword'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Nueva contraseña</FormLabel>
							<FormControl>
								<Input
									type='password'
									placeholder='••••••'
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name='repeatPassword'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Repetir nueva contraseña</FormLabel>
							<FormControl>
								<Input
									type='password'
									placeholder='••••••'
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type='submit' disabled={isPending} className='w-full'>
					{isPending ? 'Cambiando...' : 'Cambiar contraseña'}
				</Button>

				{isPending && <LoadingSpinner />}
				{isError && (
					<p className='text-red-500'>{(error as Error).message}</p>
				)}
				{isSuccess && (
					<p className='text-success'>
						¡Contraseña cambiada con éxito!
					</p>
				)}
			</form>
		</Form>
	);
}
