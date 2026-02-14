/**
 * DXF Validation Utilities
 * Validates DXF files for structural integrity before processing
 */

export interface DXFValidationResult {
	isValid: boolean;
	errors: string[];
	entityCount?: number;
}

/**
 * Validates a DXF file's structure and entities
 * @param dxf - Parsed DXF object from dxf-parser
 * @returns Validation result with errors array
 */
export function validateDXF(dxf: any): DXFValidationResult {
	const errors: string[] = [];

	// Check if DXF object exists
	if (!dxf) {
		return {
			isValid: false,
			errors: ['No se pudo procesar el archivo DXF'],
		};
	}

	// Check for entities
	if (
		!dxf.entities ||
		!Array.isArray(dxf.entities) ||
		dxf.entities.length === 0
	) {
		return {
			isValid: false,
			errors: ['El archivo DXF no contiene entidades válidas'],
		};
	}

	// Entity type labels for user-friendly messages
	const entityLabels: Record<string, string> = {
		LINE: 'Línea',
		LWPOLYLINE: 'Polilínea',
		POLYLINE: 'Polilínea',
		CIRCLE: 'Círculo',
		ARC: 'Arco',
		SPLINE: 'Curva',
		ELLIPSE: 'Elipse',
		POINT: 'Punto',
	};

	// Validate each entity
	dxf.entities.forEach((entity: any, index: number) => {
		const label = entityLabels[entity.type] || entity.type;
		const prefix = `${label} #${index + 1}`;

		if (!entity.type) {
			errors.push(`Elemento #${index + 1}: tipo de entidad no reconocido`);
			return;
		}

		switch (entity.type) {
			case 'LINE':
				if (!entity.vertices || entity.vertices.length !== 2) {
					errors.push(
						`${prefix}: línea incompleta, faltan puntos`
					);
				} else {
					entity.vertices.forEach((v: any, vIndex: number) => {
						if (v.x === undefined || v.y === undefined) {
							errors.push(
								`${prefix}: coordenadas inválidas en el punto ${vIndex + 1}`
							);
						}
						if (isNaN(v.x) || isNaN(v.y)) {
							errors.push(
								`${prefix}: valores numéricos inválidos en el punto ${vIndex + 1}`
							);
						}
					});
				}
				break;

			case 'LWPOLYLINE':
			case 'POLYLINE':
				if (!entity.vertices || entity.vertices.length < 2) {
					errors.push(
						`${prefix}: polilínea incompleta, necesita al menos 2 puntos`
					);
				} else {
					entity.vertices.forEach((v: any, vIndex: number) => {
						if (v.x === undefined || v.y === undefined) {
							errors.push(
								`${prefix}: coordenadas inválidas en el punto ${vIndex + 1}`
							);
						}
						if (isNaN(v.x) || isNaN(v.y)) {
							errors.push(
								`${prefix}: valores numéricos inválidos en el punto ${vIndex + 1}`
							);
						}
					});
				}
				break;

			case 'CIRCLE':
				if (
					!entity.center ||
					entity.center.x === undefined ||
					entity.center.y === undefined
				) {
					errors.push(`${prefix}: centro inválido`);
				}
				if (
					!entity.radius ||
					entity.radius <= 0 ||
					isNaN(entity.radius)
				) {
					errors.push(`${prefix}: radio inválido`);
				}
				break;

			case 'ARC':
				if (
					!entity.center ||
					entity.center.x === undefined ||
					entity.center.y === undefined
				) {
					errors.push(`${prefix}: centro inválido`);
				}
				if (
					!entity.radius ||
					entity.radius <= 0 ||
					isNaN(entity.radius)
				) {
					errors.push(`${prefix}: radio inválido`);
				}
				if (
					entity.startAngle === undefined ||
					entity.endAngle === undefined
				) {
					errors.push(
						`${prefix}: ángulo de inicio o fin inválido`
					);
				}
				if (isNaN(entity.startAngle) || isNaN(entity.endAngle)) {
					errors.push(
						`${prefix}: valores de ángulo inválidos`
					);
				}
				break;

			case 'SPLINE':
				if (!entity.controlPoints || entity.controlPoints.length < 2) {
					errors.push(
						`${prefix}: puntos de control insuficientes`
					);
				}
				break;

			case 'ELLIPSE':
				if (
					!entity.center ||
					!entity.majorAxisEndPoint ||
					entity.axisRatio === undefined
				) {
					errors.push(
						`${prefix}: faltan propiedades requeridas`
					);
				}
				break;

			case 'POINT':
				if (
					!entity.position ||
					entity.position.x === undefined ||
					entity.position.y === undefined
				) {
					errors.push(`${prefix}: posición inválida`);
				}
				break;

			default:
				// Unsupported types - just log to console
				console.warn(`Tipo de entidad no validado: ${entity.type}`);
		}
	});

	// Validate file extents
	if (dxf.header && dxf.header.$EXTMIN && dxf.header.$EXTMAX) {
		const extMin = dxf.header.$EXTMIN;
		const extMax = dxf.header.$EXTMAX;

		// Detect sentinel/default values (1e+20 / -1e+20) indicating extents were never computed
		// This is common in many CAD exports and is NOT an error
		const sentinelThreshold = 1e19;
		const hasSentinelValues =
			Math.abs(extMin.x) >= sentinelThreshold ||
			Math.abs(extMin.y) >= sentinelThreshold ||
			Math.abs(extMax.x) >= sentinelThreshold ||
			Math.abs(extMax.y) >= sentinelThreshold;

		if (!hasSentinelValues) {
			if (extMin.x >= extMax.x || extMin.y >= extMax.y) {
				errors.push(
					'El archivo DXF tiene dimensiones inválidas: posibles entidades abiertas o corruptas'
				);
			}
		}
	}

	return {
		isValid: errors.length === 0,
		errors,
		entityCount: dxf.entities.length,
	};
}

/**
 * Validates a DXF file by parsing its contents
 * @param file - File object to validate
 * @returns Validation result
 */
export async function validateDXFFile(
	file: File
): Promise<DXFValidationResult> {
	try {
		// Read file contents
		const text = await file.text();

		// Dynamic import of dxf-parser (client-side only)
		const DxfParser = (await import('dxf-parser')).default;
		const parser = new DxfParser();

		// Parse DXF
		const dxf = parser.parseSync(text);

		// Validate parsed DXF
		return validateDXF(dxf);
	} catch (err) {
		console.error('Error parsing DXF file:', err);
		return {
			isValid: false,
			errors: [
				`Error al procesar el archivo DXF: ${err instanceof Error ? err.message : 'Error desconocido'}`,
			],
		};
	}
}
