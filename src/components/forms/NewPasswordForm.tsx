'use client';

import { useNewPasswordMutation } from '@/hooks/auth/useNewPasswordMutation';
import { useForm, SubmitHandler } from 'react-hook-form';
import LoadingSpinner from '../LoadingSpinner';

type NewPasswordFormData = {
	newPassword: string;
	repeatPassword: string;
};

export default function NewPasswordForm({
	emailRedirectTo,
}: {
	emailRedirectTo: string;
}) {
	// 1. RHF para manejar inputs
	const {
		watch,
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<NewPasswordFormData>();

	// 2. React Query mutation
	const { mutate: newPassword, isPending } = useNewPasswordMutation();

	// 3. onSubmit -> llama al custom hook
	const onSubmit: SubmitHandler<NewPasswordFormData> = (formData) => {
		newPassword({ newPassword: formData.newPassword, emailRedirectTo });
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className='max-w-sm'>
			<div className='mb-4'>
				<label>Nueva contraseña</label>
				<input
					type='password'
					{...register('newPassword', {
						required: 'Ingresa tu contraseña',
					})}
					className='border w-full p-2'
				/>
				{errors.newPassword && (
					<p className='text-red-500'>{errors.newPassword.message}</p>
				)}
			</div>

			<div className='mb-4'>
				<label>Repetir nueva contraseña</label>
				<input
					type='password'
					{...register('repeatPassword', {
						required: 'Repite tu contraseña',
						validate: (value) =>
							value === watch('newPassword') ||
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

			{isPending && <LoadingSpinner />}

			<button
				type='submit'
				disabled={isPending}
				className='bg-blue-500 text-white p-2 rounded'
			>
				Cambiar contraseña
			</button>
		</form>
	);
}
