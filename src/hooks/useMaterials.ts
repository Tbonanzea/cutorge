'use client';

import { useQuery } from '@tanstack/react-query';
import { getMaterials, type MaterialWithTypes } from '@/app/actions/materials';

/**
 * TanStack Query hook for fetching materials with types
 * Provides caching and automatic refetching
 */
export function useMaterials() {
	return useQuery<MaterialWithTypes[], Error>({
		queryKey: ['materials'],
		queryFn: getMaterials,
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
		refetchOnWindowFocus: false,
		retry: 2,
	});
}
