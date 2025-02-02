'use client';

import supabase from '@/lib/supabase';
import { useMutation } from '@tanstack/react-query';

type LogInData = {
	email: string;
	password: string;
};

type LogInResponse = {
	success?: boolean;
	user?: string;
};

async function logInApiCall(data: LogInData): Promise<LogInResponse> {
	// 1. Se loguea en Supabase Auth
	const { error, data: supaData } = await supabase.auth.signInWithPassword({
		email: data.email,
		password: data.password,
	});

	if (error) throw new Error(error.message);

	// 2. Verifica que el user venga en la respuesta
	const supabaseUser = supaData.user;
	if (!supabaseUser) throw new Error('No se recibió el usuario');

	// 3. Trae el usuario de tu tabla local (Prisma)
	const response = await fetch(`/api/user?email=${data.email}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
	});

	if (!response.ok) {
		const errorResponse = await response.json();
		throw new Error(errorResponse.error || 'Error al obtener usuario');
	}

	return response.json() as Promise<LogInResponse>;
}

export function useLogInMutation() {
	return useMutation({
		mutationFn: (formData: LogInData) => logInApiCall(formData),
	});
}
