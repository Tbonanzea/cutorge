'use client';

import { useRequestResetPassword } from '@/hooks/auth/useRequestResetPasswordMutation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useState } from 'react';

type ForgotPasswordFormData = {
	email: string;
};

export default function ForgotPasswordForm() {
	const [showMessage, setShowMessage] = useState(false);
	// 1. RHF para manejar inputs
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ForgotPasswordFormData>();

	// 2. React Query mutation
	const { mutate: requestResetPassword } = useRequestResetPassword();

	// 3. onSubmit -> llama al custom hook
	const onSubmit: SubmitHandler<ForgotPasswordFormData> = ({ email }) => {
		setShowMessage(true);
		requestResetPassword(email);
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className='max-w-sm'>
			<div className='mb-4'>
				<label>Email</label>
				<input
					type='email'
					{...register('email', { required: 'Ingresa el email' })}
					className='border w-full p-2'
				/>
				{errors.email && (
					<p className='text-red-500'>{errors.email.message}</p>
				)}
			</div>

			{showMessage ? (
				// Confirmation icon check
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
			) : (
				<button
					type='submit'
					className='bg-blue-600 text-white py-2 px-4 rounded'
				>
					Solicitar cambio de contraseña
				</button>
			)}

			{showMessage && (
				<p className='text-green-500'>
					Si este email está registrado, recibirás un correo con
					instrucciones para cambiar tu contraseña.
				</p>
			)}
		</form>
	);
}
