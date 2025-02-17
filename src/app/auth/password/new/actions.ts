'use server';

import { NewPasswordData } from '@/hooks/auth/useNewPasswordMutation';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function newPassword({
	newPassword,
	emailRedirectTo,
}: NewPasswordData) {
	const supabase = await createClient();

	const { data, error } = await supabase.auth.updateUser({
		password: newPassword,
	});

	if (error) {
		throw new Error(error.message);
	}

	if (data.user && emailRedirectTo) {
		redirect(emailRedirectTo);
	}

	return data;
}
