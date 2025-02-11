'use server';

import { createClient } from '@/lib/supabase/server';
import { LogInData } from '@/hooks/auth/useLoginMutation';

export async function login(formData: LogInData) {
	const supabase = await createClient();

	const response = await supabase.auth.signInWithPassword(formData);

	return response;
}
