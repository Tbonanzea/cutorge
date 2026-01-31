'use server';

// import { prisma } from '@/lib/prisma'; // TODO: Uncomment when using DB

export interface MaterialWithTypes {
	id: string;
	name: string;
	description: string | null;
	types: {
		id: string;
		width: number;
		length: number;
		height: number;
		pricePerUnit: number;
		massPerUnit: number;
		stock: number;
		errorMargin: number;
		maxCutLength: number;
		minCutLength: number;
		maxCutWidth: number;
		minCutWidth: number;
	}[];
}

// HARDCODED DATA FOR TESTING - TODO: Remove when DB is seeded
const MOCK_MATERIALS: MaterialWithTypes[] = [
	{
		id: 'mat-1',
		name: 'Acero Inoxidable',
		description: 'Acero inoxidable 304 de alta calidad',
		types: [
			{
				id: 'type-1-1',
				width: 1000,
				length: 2000,
				height: 1.5,
				pricePerUnit: 150.0,
				massPerUnit: 23.55,
				stock: 50,
				errorMargin: 0.1,
				maxCutLength: 1900,
				minCutLength: 50,
				maxCutWidth: 950,
				minCutWidth: 50,
			},
			{
				id: 'type-1-2',
				width: 1000,
				length: 2000,
				height: 3.0,
				pricePerUnit: 280.0,
				massPerUnit: 47.1,
				stock: 30,
				errorMargin: 0.1,
				maxCutLength: 1900,
				minCutLength: 50,
				maxCutWidth: 950,
				minCutWidth: 50,
			},
			{
				id: 'type-1-3',
				width: 1220,
				length: 2440,
				height: 6.0,
				pricePerUnit: 650.0,
				massPerUnit: 142.0,
				stock: 15,
				errorMargin: 0.15,
				maxCutLength: 2340,
				minCutLength: 50,
				maxCutWidth: 1170,
				minCutWidth: 50,
			},
		],
	},
	{
		id: 'mat-2',
		name: 'Aluminio',
		description: 'Aluminio 6061-T6 para aplicaciones estructurales',
		types: [
			{
				id: 'type-2-1',
				width: 1000,
				length: 2000,
				height: 2.0,
				pricePerUnit: 120.0,
				massPerUnit: 10.8,
				stock: 40,
				errorMargin: 0.1,
				maxCutLength: 1950,
				minCutLength: 50,
				maxCutWidth: 950,
				minCutWidth: 50,
			},
			{
				id: 'type-2-2',
				width: 1000,
				length: 2000,
				height: 4.0,
				pricePerUnit: 220.0,
				massPerUnit: 21.6,
				stock: 25,
				errorMargin: 0.1,
				maxCutLength: 1950,
				minCutLength: 50,
				maxCutWidth: 950,
				minCutWidth: 50,
			},
			{
				id: 'type-2-3',
				width: 1220,
				length: 2440,
				height: 5.0,
				pricePerUnit: 380.0,
				massPerUnit: 40.5,
				stock: 20,
				errorMargin: 0.12,
				maxCutLength: 2390,
				minCutLength: 50,
				maxCutWidth: 1170,
				minCutWidth: 50,
			},
		],
	},
	{
		id: 'mat-3',
		name: 'Acero al Carbono',
		description: 'Acero A36 de uso general',
		types: [
			{
				id: 'type-3-1',
				width: 1000,
				length: 2000,
				height: 3.0,
				pricePerUnit: 90.0,
				massPerUnit: 47.1,
				stock: 60,
				errorMargin: 0.15,
				maxCutLength: 1900,
				minCutLength: 50,
				maxCutWidth: 950,
				minCutWidth: 50,
			},
			{
				id: 'type-3-2',
				width: 1220,
				length: 2440,
				height: 6.0,
				pricePerUnit: 200.0,
				massPerUnit: 142.0,
				stock: 35,
				errorMargin: 0.2,
				maxCutLength: 2340,
				minCutLength: 50,
				maxCutWidth: 1170,
				minCutWidth: 50,
			},
			{
				id: 'type-3-3',
				width: 1500,
				length: 3000,
				height: 10.0,
				pricePerUnit: 480.0,
				massPerUnit: 353.0,
				stock: 12,
				errorMargin: 0.25,
				maxCutLength: 2900,
				minCutLength: 100,
				maxCutWidth: 1450,
				minCutWidth: 100,
			},
		],
	},
	{
		id: 'mat-4',
		name: 'Cobre',
		description: 'Cobre electrolítico 99.9% puro',
		types: [
			{
				id: 'type-4-1',
				width: 600,
				length: 1200,
				height: 1.0,
				pricePerUnit: 280.0,
				massPerUnit: 10.68,
				stock: 25,
				errorMargin: 0.08,
				maxCutLength: 1150,
				minCutLength: 30,
				maxCutWidth: 570,
				minCutWidth: 30,
			},
			{
				id: 'type-4-2',
				width: 1000,
				length: 2000,
				height: 2.0,
				pricePerUnit: 520.0,
				massPerUnit: 35.6,
				stock: 18,
				errorMargin: 0.1,
				maxCutLength: 1950,
				minCutLength: 50,
				maxCutWidth: 950,
				minCutWidth: 50,
			},
		],
	},
	{
		id: 'mat-5',
		name: 'Latón',
		description: 'Latón CuZn37 para decoración',
		types: [
			{
				id: 'type-5-1',
				width: 600,
				length: 1200,
				height: 1.5,
				pricePerUnit: 190.0,
				massPerUnit: 10.2,
				stock: 22,
				errorMargin: 0.08,
				maxCutLength: 1150,
				minCutLength: 30,
				maxCutWidth: 570,
				minCutWidth: 30,
			},
			{
				id: 'type-5-2',
				width: 1000,
				length: 2000,
				height: 3.0,
				pricePerUnit: 340.0,
				massPerUnit: 40.8,
				stock: 15,
				errorMargin: 0.1,
				maxCutLength: 1950,
				minCutLength: 50,
				maxCutWidth: 950,
				minCutWidth: 50,
			},
		],
	},
];

/**
 * Server action to fetch all materials with their types
 * Used in quoting flow for material selection
 *
 * CURRENTLY USING MOCK DATA FOR TESTING
 */
export async function getMaterials(): Promise<MaterialWithTypes[]> {
	try {
		// TEMPORARY: Return hardcoded data for testing
		// TODO: Uncomment Prisma query when database is seeded
		return MOCK_MATERIALS;

		/* ORIGINAL PRISMA QUERY - UNCOMMENT WHEN READY
		const materials = await prisma.material.findMany({
			include: {
				types: {
					orderBy: {
						height: 'asc', // Order by thickness
					},
				},
			},
			orderBy: {
				name: 'asc',
			},
		});

		return materials;
		*/
	} catch (error) {
		console.error('Error fetching materials:', error);
		throw new Error('Failed to fetch materials');
	}
}
