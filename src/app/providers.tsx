'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = React.useState(() => new QueryClient());

	return (
		<QueryClientProvider client={queryClient}>
			{children}

			{/* Show ReactQueryDevtools only in development */}
			{process.env.NODE_ENV === 'development' && (
				<ReactQueryDevtools initialIsOpen={false} />
			)}
		</QueryClientProvider>
	);
}
