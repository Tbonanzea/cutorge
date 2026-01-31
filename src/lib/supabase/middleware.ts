import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const publicRoutes = [
	'/',
	'/error',
	'/auth/login',
	'/auth/signup',
	'/auth/password/forgot',
	'/auth/confirm',
	'/auth/callback',
	'/dxf-test', // Test page for DXF viewer
];

// Routes that require ADMIN role
const adminRoutes = ['/users', '/materials', '/orders', '/extras'];

export async function updateSession(request: NextRequest) {
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
				setAll(cookiesToSet) {
					cookiesToSet.forEach(({ name, value }) =>
						request.cookies.set(name, value)
					);
					supabaseResponse = NextResponse.next({
						request,
					});
					cookiesToSet.forEach(({ name, value, options }) =>
						supabaseResponse.cookies.set(name, value, options)
					);
				},
			},
		}
	);

	// Do not run code between createServerClient and
	// supabase.auth.getUser(). A simple mistake could make it very hard to debug
	// issues with users being randomly logged out.

	// IMPORTANT: DO NOT REMOVE auth.getUser()

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user && !publicRoutes.includes(request.nextUrl.pathname)) {
		// no user, potentially respond by redirecting the user to the login page
		const url = request.nextUrl.clone();
		url.pathname = '/auth/login';
		return NextResponse.redirect(url);
	}

	// Check admin role for admin routes
	if (user) {
		const pathname = request.nextUrl.pathname;
		const isAdminRoute = adminRoutes.some((route) =>
			pathname.startsWith(route)
		);

		if (isAdminRoute) {
			// Query Prisma to get user role
			const prisma = new PrismaClient();
			try {
				const dbUser = await prisma.user.findUnique({
					where: { id: user.id },
					select: { role: true },
				});

				if (!dbUser || dbUser.role !== 'ADMIN') {
					// User is not admin, redirect to home or unauthorized page
					const url = request.nextUrl.clone();
					url.pathname = '/';
					return NextResponse.redirect(url);
				}
			} finally {
				await prisma.$disconnect();
			}
		}
	}

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
