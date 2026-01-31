'use client';

import { useQuery } from '@tanstack/react-query';

export interface ExtraService {
	id: string;
	name: string;
	description: string | null;
	price: number;
	unit: string;
	isActive: boolean;
}

async function fetchActiveExtraServices(): Promise<ExtraService[]> {
	const response = await fetch('/api/extras');
	if (!response.ok) {
		throw new Error('Failed to fetch extra services');
	}
	return response.json();
}

/**
 * Hook to fetch active extra services from the database
 */
export function useExtraServices() {
	return useQuery({
		queryKey: ['extraServices'],
		queryFn: fetchActiveExtraServices,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Calculate total price of selected extras
 */
export function calculateExtrasTotal(
	selectedIds: string[],
	extras: ExtraService[]
): number {
	return selectedIds.reduce((total, id) => {
		const extra = extras.find((e) => e.id === id);
		return total + (extra?.price || 0);
	}, 0);
}

/**
 * Get extra service by ID from the list
 */
export function getExtraById(
	id: string,
	extras: ExtraService[]
): ExtraService | undefined {
	return extras.find((e) => e.id === id);
}
