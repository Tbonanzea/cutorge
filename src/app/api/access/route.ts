import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'site-access-granted';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { password } = body;

		// Get the site password from environment
		const sitePassword = process.env.SITE_PASSWORD;

		// If no site password is configured, deny access
		if (!sitePassword) {
			return NextResponse.json(
				{ error: 'Site password not configured' },
				{ status: 500 },
			);
		}

		// Validate password
		if (!password || password !== sitePassword) {
			return NextResponse.json(
				{ error: 'Contraseña incorrecta' },
				{ status: 401 },
			);
		}

		// Create response with success status
		const response = NextResponse.json(
			{ success: true, message: 'Acceso concedido' },
			{ status: 200 },
		);

		// Set the access cookie
		response.cookies.set({
			name: COOKIE_NAME,
			value: 'true',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: COOKIE_MAX_AGE,
			path: '/',
		});

		return response;
	} catch (error) {
		console.error('Access API error:', error);
		return NextResponse.json(
			{ error: 'Error al procesar la solicitud' },
			{ status: 500 },
		);
	}
}
