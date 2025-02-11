'use client';

import { useSearchParams } from 'next/navigation';

export default function ErrorPage() {
	const searchParams = useSearchParams();
	return (
		<div>
			<h1>Error</h1>
			<p>Lo sentimos, hubo un error inesperado</p>
			<p>{searchParams.get('error')}</p>
		</div>
	);
}
