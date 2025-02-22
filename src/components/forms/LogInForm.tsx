'use client';

import { useLogInMutation } from '@/hooks/auth/useLoginMutation';
import Link from 'next/link';
import { useForm, SubmitHandler } from 'react-hook-form';

type LogInFormData = {
	email: string;
	password: string;
	repeatPassword: string;
};

export default function LogInForm() {
	// 1. RHF para manejar inputs
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LogInFormData>();

	// 2. React Query mutation
	const {
		mutate: logIn,
		isPending,
		isError,
		isSuccess,
		error,
		data,
	} = useLogInMutation();

	// 3. onSubmit -> llama al custom hook
	const onSubmit: SubmitHandler<LogInFormData> = (formData) => {
		logIn(formData);
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className='max-w-sm'>
			<div className='mb-4'>
				<label>Email</label>
				<input
					type='email'
					{...register('email', { required: 'Ingresa tu email' })}
					className='border w-full p-2'
				/>
				{errors.email && (
					<p className='text-red-500'>{errors.email.message}</p>
				)}
			</div>

			<div className='mb-4'>
				<label>Contraseña</label>
				<input
					type='password'
					{...register('password', {
						required: 'Ingresa tu contraseña',
					})}
					className='border w-full p-2'
				/>
				{errors.password && (
					<p className='text-red-500'>{errors.password.message}</p>
				)}
			</div>

			<button
				type='submit'
				disabled={isPending}
				className='bg-blue-600 text-white py-2 px-4 rounded'
			>
				{isPending ? 'Iniciando sesion...' : 'Iniciar sesion'}
			</button>

			<Link href='/auth/signup'> No tienes cuenta? Registrate</Link>

			<p className='mt-2'>
				<a href='/auth/password/forgot'>Olvidaste tu contraseña?</a>
			</p>

			{isError && (
				<p className='text-red-500 mt-2'>{(error as Error).message}</p>
			)}
			{isSuccess && (
				<p className='text-green-600 mt-2'>{JSON.stringify(data)}</p>
			)}
		</form>
	);
}
