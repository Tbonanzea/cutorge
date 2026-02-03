'use server';

import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';

export type PermissionResult = {
	authorized: boolean;
	userId?: string;
	isAdmin?: boolean;
	error?: string;
};

/**
 * Check if the current user is authenticated and optionally if they are an admin
 * Use this at the start of server actions that require authentication or admin access
 */
export async function checkPermission(
	requireAdmin = false
): Promise<PermissionResult> {
	try {
		const supabase = await createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return {
				authorized: false,
				error: 'No autenticado',
			};
		}

		const dbUser = await prisma.user.findUnique({
			where: { id: user.id },
			select: { role: true },
		});

		if (!dbUser) {
			return {
				authorized: false,
				error: 'Usuario no encontrado en la base de datos',
			};
		}

		const isAdmin = dbUser.role === 'ADMIN';

		if (requireAdmin && !isAdmin) {
			return {
				authorized: false,
				userId: user.id,
				isAdmin: false,
				error: 'Se requieren permisos de administrador',
			};
		}

		return {
			authorized: true,
			userId: user.id,
			isAdmin,
		};
	} catch (error: any) {
		return {
			authorized: false,
			error: error.message || 'Error al verificar permisos',
		};
	}
}

/**
 * Wrapper function to require admin permission
 * Returns the user ID if authorized, throws if not
 */
export async function requireAdmin(): Promise<string> {
	const result = await checkPermission(true);
	if (!result.authorized) {
		throw new Error(result.error || 'No autorizado');
	}
	return result.userId!;
}

/**
 * Wrapper function to require authentication (but not admin)
 * Returns the user ID if authorized, throws if not
 */
export async function requireAuth(): Promise<string> {
	const result = await checkPermission(false);
	if (!result.authorized) {
		throw new Error(result.error || 'No autorizado');
	}
	return result.userId!;
}
