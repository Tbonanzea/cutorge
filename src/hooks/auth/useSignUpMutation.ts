'use client';

import { createUser, getUserByEmail } from '@/app/(dashboard)/users/actions';
import { signup } from '@/app/auth/signup/actions';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { User } from '@/types';

export type SignUpData = {
	email: string;
	password: string;
};

type SignUpResponse = {
	success: boolean;
	user: User;
};

async function signUpApiCall(data: SignUpData): Promise<SignUpResponse> {
	// 0. Verifica si el usuario ya existe en la base de datos
	const exists = await getUserByEmail(data.email);

	if (!exists.success || !exists.user) {
		const errorResponse = exists.error;
		throw new Error(errorResponse.error || 'Error al obtener usuario');
	}

	if (exists.success) {
		throw new Error('Ya existe un usuario con ese email');
	}

	// 1. Crea el usuario en Supabase Auth
	const supabaseResponse = await signup(data);

	// 2. Verifica que el user venga en la respuesta
	const supabaseUser = supabaseResponse.data.user;
	if (!supabaseUser) throw new Error('No se recibió el usuario');

	// 3. Crea el usuario en tu tabla local (Prisma)
	const response = await createUser(supabaseUser.id, data.email);

	if (!response.success || !response.user) {
		const errorResponse = response.error;
		throw new Error(errorResponse.error || 'Error al crear usuario');
	}

	return { success: response.success, user: response.user };
}

export function useSignUpMutation() {
	const router = useRouter();
	return useMutation({
		mutationFn: (formData: SignUpData) => signUpApiCall(formData),
		onSuccess: () => router.push('/'),
	});
}
