'use server';

import { createClient } from '@/lib/supabase/server';
import { LogInData } from '@/hooks/auth/useLoginMutation';
import prisma from '@/lib/prisma';
import { AuthProvider } from '@prisma/client';

export async function login(formData: LogInData) {
	const supabase = await createClient();

	const { data, error } = await supabase.auth.signInWithPassword(formData);

	if (error) {
		// Check is user is social login in prisma
		let appendMessage = '';
		const user = await prisma.user.findUnique({
			where: {
				email: formData.email,
			},
		});

		if (!user) {
			throw new Error('Usuario no existe.');
		}

		// Append message if user is not local
		if (!user?.authProviders.includes(AuthProvider.local)) {
			appendMessage = `Tu usuario fue creado con ${user?.authProviders.filter(
				(provider) => provider !== AuthProvider.local
			)}, por favor inicia sesion con alguno de estos metodos.`;
		}

		throw new Error(`Inicio de sesion invalido. ${appendMessage}`);
	}

	return data;
}
