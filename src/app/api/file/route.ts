import { NextResponse, NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
	try {
		return NextResponse.json({ success: true });
	} catch (error: any) {
		console.error(error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
