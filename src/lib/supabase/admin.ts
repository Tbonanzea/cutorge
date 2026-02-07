import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase admin client with service role key.
 * This client bypasses Row Level Security (RLS) and should only be used
 * in secure server-side contexts (API routes, Server Components).
 *
 * Used for:
 * - Supabase Storage operations (file uploads/downloads)
 * - Admin operations that require elevated privileges
 */
export function createAdminClient() {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

	if (!supabaseUrl || !supabaseServiceKey) {
		throw new Error(
			'Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
		);
	}

	return createClient(supabaseUrl, supabaseServiceKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	});
}
