import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import NavBar from './NavBar';

export default async function Header() {
	let isAdmin = false;

	try {
		const supabase = await createClient();
		const { data: { user } } = await supabase.auth.getUser();

		if (user) {
			const dbUser = await prisma.user.findUnique({
				where: { id: user.id },
				select: { role: true },
			});
			isAdmin = dbUser?.role === 'ADMIN';
		}
	} catch {
		// User not authenticated or error fetching - default to non-admin
	}

	return (
		<header>
			<NavBar isAdmin={isAdmin} />
		</header>
	);
}
