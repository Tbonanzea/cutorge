import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
	return await updateSession(request);
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - localDebug (test files)
		 * - Static assets (svg, png, jpg, gif, webp, dxf, DXF)
		 */
		'/((?!_next/static|_next/image|favicon.ico|localDebug|.*\\.(?:svg|png|jpg|jpeg|gif|webp|dxf|DXF|webmanifest|ico)$).*)',
	],
};
