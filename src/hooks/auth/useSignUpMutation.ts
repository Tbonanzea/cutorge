'use client';

import supabase from '@/lib/supabase';
import { useMutation } from '@tanstack/react-query';

// Define la forma de los datos que esperas del form
type SignUpData = {
	email: string;
	password: string;
};

// Si devuelves algo en tu endpoint, puedes definir un tipo de respuesta
type SignUpResponse = {
	success?: boolean;
	user?: string;
	// etc.
};

async function signUpApiCall(data: SignUpData): Promise<SignUpResponse> {
	// 0. Verifica si el usuario ya existe en la base de datos
	const exists = await fetch(`/api/user?email=${data.email} `, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
	});

	if (exists.ok) {
		throw new Error('Ya existe un usuario con ese email');
	}

	// 1. Crea el usuario en Supabase Auth
	const { error, data: supaData } = await supabase.auth.signUp({
		email: data.email,
		password: data.password,
	});

	if (error) throw new Error(error.message);

	// 2. Verifica que el user venga en la respuesta
	const supabaseUser = supaData.user;
	if (!supabaseUser) throw new Error('No se recibió el usuario');

	// 3. Crea el usuario en tu tabla local (Prisma)
	const response = await fetch('/api/user', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			id: supabaseUser.id,
			email: supabaseUser.email,
		}),
	});

	if (!response.ok) {
		const errorResponse = await response.json();
		throw new Error(errorResponse.error || 'Error al crear usuario');
	}

	alert('¡Usuario registrado exitosamente!');

	return response.json() as Promise<SignUpResponse>;
}

export function useSignUpMutation() {
	return useMutation({
		mutationFn: (formData: SignUpData) => signUpApiCall(formData),
	});
}
