import { NextResponse } from 'next/server';
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/lib/supabase/server';
import { createUser, updateUser } from '@/app/(dashboard)/users/actions';
import { AuthProvider } from '@prisma/client';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
	const { searchParams, origin } = new URL(request.url);
	const code = searchParams.get('code');
	// if "next" is in param, use it as the redirect URL
	const next = searchParams.get('next') ?? '/';

	if (code) {
		const supabase = await createClient();
		const { data, error } = await supabase.auth.exchangeCodeForSession(
			code
		);
		const authProvider = data.user?.app_metadata.provider;

		if (!error && data.user.email) {
			// if user doesn't exist, create
			const existingUser = await prisma.user.findUnique({
				where: { email: data.user.email },
			});
			if (!existingUser) {
				const { error } = await createUser({
					id: data.user.id,
					email: data.user.email,
					...(authProvider && {
						authProviders: [authProvider as AuthProvider],
					}),
				});

				if (error) {
					await supabase.auth.signOut();
					return NextResponse.redirect(
						`${origin}/error?error=${error}`
					);
				}
			} else {
				// update authProviders if not already set without eliminating existing ones
				if (
					!existingUser.authProviders.includes(
						authProvider as AuthProvider
					)
				) {
					await updateUser(existingUser.id, {
						authProviders: [
							...existingUser.authProviders,
							authProvider as AuthProvider,
						],
					});
				}
			}

			const forwardedHost = request.headers.get('x-forwarded-host'); // original origin before load balancer
			const isLocalEnv = process.env.NODE_ENV === 'development';
			if (isLocalEnv) {
				// we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
				return NextResponse.redirect(`${origin}${next}`);
			} else if (forwardedHost) {
				return NextResponse.redirect(`https://${forwardedHost}${next}`);
			} else {
				return NextResponse.redirect(`${origin}${next}`);
			}
		} else {
			return NextResponse.redirect(
				`${origin}/error?error=Invalid%20code%20or%20user`
			);
		}
	}

	// return the user to an error page with instructions
	return NextResponse.redirect(`${origin}/error?error=Invalid%20code`);
}
