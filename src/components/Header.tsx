import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import NavBar from './NavBar';

export type UserData = {
	email: string;
	firstName?: string | null;
	lastName?: string | null;
	isAdmin: boolean;
};

export default async function Header() {
	let userData: UserData | null = null;

	try {
		const supabase = await createClient();
		const { data: { user } } = await supabase.auth.getUser();

		if (user) {
			const dbUser = await prisma.user.findUnique({
				where: { id: user.id },
				select: {
					email: true,
					firstName: true,
					lastName: true,
					role: true,
				},
			});

			if (dbUser) {
				userData = {
					email: dbUser.email,
					firstName: dbUser.firstName,
					lastName: dbUser.lastName,
					isAdmin: dbUser.role === 'ADMIN',
				};
			}
		}
	} catch {
		// User not authenticated or error fetching - userData remains null
	}

	return (
		<header>
			<NavBar user={userData} />
		</header>
	);
}
