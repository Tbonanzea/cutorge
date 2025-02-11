import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		// La configuración por defecto guarda la sesión en localStorage,
		// pero @supabase/ssr en el middleware se encargará de sincronizar la sesión vía cookies.
		// Revisa la documentación para ver si necesitas ajustes adicionales.
		persistSession: true,
		autoRefreshToken: true,
	},
});
