'use client';

import { newPassword } from '@/app/auth/actions';
import { useMutation } from '@tanstack/react-query';

export type NewPasswordData = {
	newPassword: string;
	emailRedirectTo: string;
};

type NewPasswordResponse = boolean;

async function newPasswordApiCall(
	data: NewPasswordData
): Promise<NewPasswordResponse> {
	await newPassword(data);

	return true;
}

export function useNewPasswordMutation() {
	return useMutation({
		mutationFn: (data: NewPasswordData) => newPasswordApiCall(data),
	});
}
