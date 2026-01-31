'use client';

import { redirect, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ErrorContent() {
	const searchParams = useSearchParams();
	if (!searchParams.get('error')) {
		redirect('/');
	}
	return (
		<div>
			<h1>Error</h1>
			<p>Lo sentimos, hubo un error inesperado</p>
			<p>{searchParams.get('error')}</p>
			{searchParams.get('error_code') && (
				<p>Código de error: {searchParams.get('error_code')}</p>
			)}
			{searchParams.get('error_description') && (
				<p>Descripción: {searchParams.get('error_description')}</p>
			)}
		</div>
	);
}

export default function ErrorPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<ErrorContent />
		</Suspense>
	);
}
