'use client';

import { signInWithGoogle } from '@/app/auth/actions';
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
import { useSignUpMutation } from '@/hooks/auth/useSignUpMutation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z
	.object({
		email: z.string().email({ message: 'Email inválido' }),
		password: z.string().min(6, { message: 'Mínimo 6 caracteres' }),
		repeatPassword: z.string(),
	})
	.refine((data) => data.password === data.repeatPassword, {
		message: 'Las contraseñas no coinciden',
		path: ['repeatPassword'],
	});

export default function SignUpForm() {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: '',
			password: '',
			repeatPassword: '',
		},
	});

	const {
		mutate: signUp,
		isPending,
		isError,
		isSuccess,
		error,
	} = useSignUpMutation();

	const onSubmit = (data: z.infer<typeof formSchema>) => {
		signUp(data);
	};

	const onGoogleClick = () => {
		signInWithGoogle();
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className='space-y-4 max-w-sm'
			>
				<FormField
					control={form.control}
					name='email'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input
									type='email'
									placeholder='tu@email.com'
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name='password'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Contraseña</FormLabel>
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
							<FormLabel>Repetir contraseña</FormLabel>
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
					{isPending ? 'Registrando...' : 'Registrarme'}
				</Button>

				{isError && (
					<p className='text-red-500 mt-2'>
						{(error as Error).message}
					</p>
				)}
				{isSuccess && (
					<p className='text-success mt-2'>
						¡Registro exitoso! Verifica tu email para poder iniciar
						sesión.
					</p>
				)}

				<Button
					type='button'
					variant='outline'
					onClick={onGoogleClick}
					className='w-full'
				>
					Google
				</Button>
			</form>
		</Form>
	);
}
