'use client';

import { requestResetPassword } from '@/app/auth/actions';
import { useMutation } from '@tanstack/react-query';

type RequestPasswordResetResponse = boolean;

async function requestResetPasswordApiCall(
	email: string
): Promise<RequestPasswordResetResponse> {
	await requestResetPassword(email);

	return true;
}

export function useRequestResetPassword() {
	return useMutation({
		mutationFn: (email: string) => requestResetPasswordApiCall(email),
	});
}
