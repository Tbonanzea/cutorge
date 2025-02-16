'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { useSignUpMutation } from '@/hooks/auth/useSignUpMutation';
import { signInWithGoogle } from '@/app/auth/signup/actions';

type SignUpFormData = {
	email: string;
	password: string;
	repeatPassword: string;
};

export default function SignUpForm() {
	// 1. RHF para manejar inputs
	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<SignUpFormData>();

	// 2. React Query mutation
	const {
		mutate: signUp,
		isPending,
		isError,
		isSuccess,
		error,
	} = useSignUpMutation();

	// 3. onSubmit -> llama al custom hook
	const onSubmit: SubmitHandler<SignUpFormData> = (formData) => {
		signUp(formData);
	};

	const onGoogleClick = () => {
		signInWithGoogle();
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

			<div className='mb-4'>
				<label>Repetir contraseña</label>
				<input
					type='password'
					{...register('repeatPassword', {
						required: 'Repite tu contraseña',
						validate: (value) =>
							value === watch('password') ||
							'Las contraseñas no coinciden',
					})}
					className='border w-full p-2'
				/>
				{errors.repeatPassword && (
					<p className='text-red-500'>
						{errors.repeatPassword.message}
					</p>
				)}
			</div>

			<button
				type='submit'
				disabled={isPending}
				className='bg-blue-600 text-white py-2 px-4 rounded'
			>
				{isPending ? 'Registrando...' : 'Registrarme'}
			</button>

			{isError && (
				<p className='text-red-500 mt-2'>{(error as Error).message}</p>
			)}
			{isSuccess && (
				<p className='text-green-600 mt-2'>
					Registro exitoso! Verifica tu email para poder loguearte
				</p>
			)}

			<button
				type='button'
				onClick={onGoogleClick}
				className='bg-white text-black py-2 px-4 rounded mt-4'
			>
				Google
			</button>
		</form>
	);
}
