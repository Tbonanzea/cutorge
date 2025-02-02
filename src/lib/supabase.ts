import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_KEY!,
	{
		auth: {
			persistSession: true,
			autoRefreshToken: true,
		},
	}
);

export default supabase;
