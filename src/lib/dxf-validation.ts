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
			errors: ['DXF file could not be parsed'],
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
			errors: ['DXF file contains no valid entities'],
		};
	}

	// Validate each entity
	dxf.entities.forEach((entity: any, index: number) => {
		if (!entity.type) {
			errors.push(`Entity ${index + 1}: Missing entity type`);
			return;
		}

		switch (entity.type) {
			case 'LINE':
				if (!entity.vertices || entity.vertices.length !== 2) {
					errors.push(
						`Entity ${index + 1} (LINE): Incomplete - must have exactly 2 vertices`
					);
				} else {
					entity.vertices.forEach((v: any, vIndex: number) => {
						if (v.x === undefined || v.y === undefined) {
							errors.push(
								`Entity ${index + 1} (LINE): Vertex ${vIndex + 1} has invalid coordinates`
							);
						}
						if (isNaN(v.x) || isNaN(v.y)) {
							errors.push(
								`Entity ${index + 1} (LINE): Vertex ${vIndex + 1} has invalid numeric values`
							);
						}
					});
				}
				break;

			case 'LWPOLYLINE':
			case 'POLYLINE':
				if (!entity.vertices || entity.vertices.length < 2) {
					errors.push(
						`Entity ${index + 1} (${entity.type}): Incomplete - must have at least 2 vertices`
					);
				} else {
					entity.vertices.forEach((v: any, vIndex: number) => {
						if (v.x === undefined || v.y === undefined) {
							errors.push(
								`Entity ${index + 1} (${entity.type}): Vertex ${vIndex + 1} has invalid coordinates`
							);
						}
						if (isNaN(v.x) || isNaN(v.y)) {
							errors.push(
								`Entity ${index + 1} (${entity.type}): Vertex ${vIndex + 1} has invalid numeric values`
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
					errors.push(`Entity ${index + 1} (CIRCLE): Invalid center`);
				}
				if (
					!entity.radius ||
					entity.radius <= 0 ||
					isNaN(entity.radius)
				) {
					errors.push(`Entity ${index + 1} (CIRCLE): Invalid radius`);
				}
				break;

			case 'ARC':
				if (
					!entity.center ||
					entity.center.x === undefined ||
					entity.center.y === undefined
				) {
					errors.push(`Entity ${index + 1} (ARC): Invalid center`);
				}
				if (
					!entity.radius ||
					entity.radius <= 0 ||
					isNaN(entity.radius)
				) {
					errors.push(`Entity ${index + 1} (ARC): Invalid radius`);
				}
				if (
					entity.startAngle === undefined ||
					entity.endAngle === undefined
				) {
					errors.push(
						`Entity ${index + 1} (ARC): Invalid start or end angle`
					);
				}
				if (isNaN(entity.startAngle) || isNaN(entity.endAngle)) {
					errors.push(
						`Entity ${index + 1} (ARC): Invalid numeric angle values`
					);
				}
				break;

			case 'SPLINE':
				if (!entity.controlPoints || entity.controlPoints.length < 2) {
					errors.push(
						`Entity ${index + 1} (SPLINE): Insufficient control points`
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
						`Entity ${index + 1} (ELLIPSE): Missing required properties`
					);
				}
				break;

			case 'POINT':
				if (
					!entity.position ||
					entity.position.x === undefined ||
					entity.position.y === undefined
				) {
					errors.push(`Entity ${index + 1} (POINT): Invalid position`);
				}
				break;

			default:
				// Unsupported types - just log to console
				console.warn(`Unvalidated entity type: ${entity.type}`);
		}
	});

	// Validate file extents
	if (dxf.header && dxf.header.$EXTMIN && dxf.header.$EXTMAX) {
		const extMin = dxf.header.$EXTMIN;
		const extMax = dxf.header.$EXTMAX;

		if (extMin.x >= extMax.x || extMin.y >= extMax.y) {
			errors.push(
				'DXF file has invalid extents - possible open or corrupt entities'
			);
		}

		// Check for extreme values indicating problems
		const extremeValue = 1e19;
		if (
			Math.abs(extMin.x) > extremeValue ||
			Math.abs(extMin.y) > extremeValue ||
			Math.abs(extMax.x) > extremeValue ||
			Math.abs(extMax.y) > extremeValue
		) {
			errors.push(
				'DXF file contains entities with extreme coordinates - file may be corrupt'
			);
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
				`Failed to parse DXF file: ${err instanceof Error ? err.message : 'Unknown error'}`,
			],
		};
	}
}
