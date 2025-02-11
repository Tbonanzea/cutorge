'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LogInData } from '@/hooks/auth/useLoginMutation';

export async function login(formData: LogInData) {
	const supabase = await createClient();

	const { data, error } = await supabase.auth.signInWithPassword(formData);

	if (error) {
		redirect(`/error?error=${error.message}`);
	}

	return data;
}
