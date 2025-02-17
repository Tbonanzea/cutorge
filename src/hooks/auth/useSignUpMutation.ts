'use client';

import { signup } from '@/app/auth/actions';
import { useMutation } from '@tanstack/react-query';
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
	const response = await signup(data);
	if (!response.success || !response.user) {
		const errorResponse = response.error;
		throw new Error(errorResponse.error || 'Error al crear usuario');
	}

	return { success: response.success, user: response.user };
}

export function useSignUpMutation() {
	return useMutation({
		mutationFn: (formData: SignUpData) => signUpApiCall(formData),
	});
}
