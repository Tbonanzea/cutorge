'use server';

import { SignUpData } from '@/hooks/auth/useSignUpMutation';
import { createClient } from '@/lib/supabase/server';

export async function signup(formData: SignUpData) {
	const supabase = await createClient();

	const response = await supabase.auth.signUp(formData);

	return response;
}
