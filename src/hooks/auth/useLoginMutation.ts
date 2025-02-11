'use client';

import { getUserByEmail } from '@/app/(dashboard)/users/actions';
import { login } from '@/app/auth/login/actions';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { User } from 'types';

export type LogInData = {
	email: string;
	password: string;
};

type LogInResponse = {
	success: boolean;
	user: User;
};

async function logInApiCall(data: LogInData): Promise<LogInResponse> {
	// 1. Se loguea en Supabase Auth
	const supabaseResponse = await login(data);

	const supabaseUser =
		supabaseResponse.user || supabaseResponse.session?.user;
	if (!supabaseUser) throw new Error('No se recibió el usuario');

	// 3. Trae el usuario de tu tabla local (Prisma)
	const response = await getUserByEmail(data.email);

	if (!response.success || !response.user) {
		const errorResponse = response.error;
		throw new Error(errorResponse.error || 'Error al obtener usuario');
	}

	return { success: response.success, user: response.user };
}

export function useLogInMutation() {
	const router = useRouter();
	return useMutation({
		mutationFn: (formData: LogInData) => logInApiCall(formData),
		onSuccess: () => router.push('/'),
	});
}
