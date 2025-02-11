'use server';

import { SignUpData } from '@/hooks/auth/useSignUpMutation';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function signup(formData: SignUpData) {
	const supabase = await createClient();

	const { data, error } = await supabase.auth.signUp(formData);

	if (error) {
		redirect(`/error?error=${error.message}`);
	}

	return data;
}
