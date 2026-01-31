/**
 * Centralized constants for CutForge application
 */

export interface ExtraService {
	id: string;
	name: string;
	description: string;
	price: number;
	unit: string;
}

/**
 * Extra services available for orders
 * Used across quoting flow (extras page, review page, submission)
 */
export const EXTRA_SERVICES: ExtraService[] = [
	{
		id: 'engraving',
		name: 'Grabado láser',
		description: 'Personaliza tu pieza con texto o diseños grabados',
		price: 15,
		unit: 'por pieza',
	},
	{
		id: 'painting',
		name: 'Pintura/Acabado',
		description: 'Aplicación de pintura o acabados especiales',
		price: 25,
		unit: 'por pieza',
	},
	{
		id: 'assembly',
		name: 'Ensamblaje',
		description: 'Armado de piezas múltiples',
		price: 50,
		unit: 'por proyecto',
	},
	{
		id: 'express',
		name: 'Entrega Express',
		description: 'Entrega en 24-48 horas',
		price: 100,
		unit: 'por pedido',
	},
	{
		id: 'packaging',
		name: 'Empaque Especial',
		description: 'Empaque personalizado para presentación',
		price: 20,
		unit: 'por pedido',
	},
	{
		id: 'design-review',
		name: 'Revisión de Diseño',
		description: 'Análisis y optimización del diseño para corte',
		price: 75,
		unit: 'por proyecto',
	},
];

/**
 * Helper function to calculate total price of selected extras
 */
export function calculateExtrasTotal(selectedExtraIds: string[]): number {
	return selectedExtraIds.reduce((total, extraId) => {
		const extra = EXTRA_SERVICES.find((e) => e.id === extraId);
		return total + (extra?.price || 0);
	}, 0);
}

/**
 * Helper function to get extra service by ID
 */
export function getExtraServiceById(extraId: string): ExtraService | undefined {
	return EXTRA_SERVICES.find((e) => e.id === extraId);
}
