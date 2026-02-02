'use client';

import { useRequestResetPassword } from '@/hooks/auth/useRequestResetPasswordMutation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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

const forgotPasswordSchema = z.object({
	email: z.string().email('Ingresa un email válido'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
	const [showMessage, setShowMessage] = useState(false);

	const form = useForm<ForgotPasswordFormData>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: {
			email: '',
		},
	});

	const { mutate: requestResetPassword } = useRequestResetPassword();

	const onSubmit = ({ email }: ForgotPasswordFormData) => {
		setShowMessage(true);
		requestResetPassword(email);
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className='max-w-sm space-y-4'
			>
				<FormField
					control={form.control}
					name='email'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input
									placeholder='tuemail@ejemplo.com'
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{showMessage ? (
					<div className='flex items-center space-x-2 text-success'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							className='h-6 w-6 text-green-500'
							fill='none'
							viewBox='0 0 24 24'
							stroke='currentColor'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M5 13l4 4L19 7'
							/>
						</svg>
						<p>
							Si este email está registrado, recibirás un correo
							con instrucciones para cambiar tu contraseña.
						</p>
					</div>
				) : (
					<Button type='submit'>
						Solicitar cambio de contraseña
					</Button>
				)}
			</form>
		</Form>
	);
}
