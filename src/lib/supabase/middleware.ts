import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const publicRoutes = [
	'/',
	'/error',
	'/auth/login',
	'/auth/signup',
	'/auth/password/forgot',
	'/auth/confirm',
	'/auth/callback',
	'/about',
	'/guidelines',
	'/access',
	'/dxf-test',
];

// Routes that start with these prefixes are public (webhooks, etc.)
const publicPrefixes = [
	'/api/webhooks/',
	'/api/access',
];

export async function updateSession(request: NextRequest) {
	// Site-wide password protection check (before Supabase auth)
	const sitePassword = process.env.SITE_PASSWORD;

	if (sitePassword) {
		const { pathname } = request.nextUrl;

		// Only /access and /api/access are exempt from site password
		const isPasswordExempt = pathname === '/access' ||
			pathname.startsWith('/api/access');

		if (!isPasswordExempt) {
			// Check for access cookie
			const accessCookie = request.cookies.get('site-access-granted');

			if (!accessCookie) {
				const url = request.nextUrl.clone();
				url.pathname = '/access';
				return NextResponse.redirect(url);
			}
		}
	}
	let supabaseResponse = NextResponse.next({
		request,
	});

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
					cookiesToSet.forEach(({ name, value }) =>
						request.cookies.set(name, value),
					);
					supabaseResponse = NextResponse.next({
						request,
					});
					cookiesToSet.forEach(({ name, value, options }) =>
						supabaseResponse.cookies.set(name, value, options),
					);
				},
			},
		},
	);

	// Do not run code between createServerClient and
	// supabase.auth.getUser(). A simple mistake could make it very hard to debug
	// issues with users being randomly logged out.

	// IMPORTANT: DO NOT REMOVE auth.getUser()

	const {
		data: { user },
	} = await supabase.auth.getUser();

	const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);
	const isPublicPrefix = publicPrefixes.some(prefix =>
		request.nextUrl.pathname.startsWith(prefix)
	);

	if (!user && !isPublicRoute && !isPublicPrefix) {
		// no user, potentially respond by redirecting the user to the login page
		const url = request.nextUrl.clone();
		url.pathname = '/auth/login';
		return NextResponse.redirect(url);
	}

	// Note: Admin role verification is done in the dashboard layout
	// because Prisma cannot run in Edge Runtime (middleware)

	// IMPORTANT: You *must* return the supabaseResponse object as it is.
	// If you're creating a new response object with NextResponse.next() make sure to:
	// 1. Pass the request in it, like so:
	//    const myNewResponse = NextResponse.next({ request })
	// 2. Copy over the cookies, like so:
	//    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
	// 3. Change the myNewResponse object to fit your needs, but avoid changing
	//    the cookies!
	// 4. Finally:
	//    return myNewResponse
	// If this is not done, you may be causing the browser and server to go out
	// of sync and terminate the user's session prematurely!

	return supabaseResponse;
}
