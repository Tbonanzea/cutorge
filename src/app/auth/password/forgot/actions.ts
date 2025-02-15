'use server';

import { createClient } from '@/lib/supabase/server';

export async function requestResetPassword(email: string) {
	const supabase = await createClient();

	const { data } = await supabase.auth.resetPasswordForEmail(email, {
		redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/quoting`,
	});

	return data;
}
