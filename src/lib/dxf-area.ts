import * as THREE from 'three';

/**
 * Compute 2D polygon area using the shoelace formula.
 * Returns area in square DXF units (typically mm²).
 */
export function computeArea(points: { x: number; y: number }[]): number {
	let area = 0;
	for (let i = 0; i < points.length; i++) {
		const j = (i + 1) % points.length;
		area += points[i].x * points[j].y;
		area -= points[j].x * points[i].y;
	}
	return Math.abs(area) / 2;
}

/**
 * Try to extract a closed THREE.Shape and its area from a DXF entity.
 * Only handles inherently closed entities: CIRCLE, full ARC, closed LWPOLYLINE/POLYLINE, full ELLIPSE.
 */
export function getClosedShapeFromEntity(entity: any): { shape: THREE.Shape; area: number } | null {
	switch (entity.type) {
		case 'CIRCLE': {
			const shape = new THREE.Shape();
			shape.absarc(entity.center.x, entity.center.y, entity.radius, 0, Math.PI * 2, false);
			return { shape, area: Math.PI * entity.radius * entity.radius };
		}
		case 'ARC': {
			// Detect full 360° arcs (they represent circles in some CAD exports)
			if (!entity.center || !entity.radius) return null;
			let sweep = (entity.endAngle || 0) - (entity.startAngle || 0);
			if (sweep <= 0) sweep += 2 * Math.PI;
			if (Math.abs(sweep - 2 * Math.PI) > 0.01) return null; // Not a full circle
			const shape = new THREE.Shape();
			shape.absarc(entity.center.x, entity.center.y, entity.radius, 0, Math.PI * 2, false);
			return { shape, area: Math.PI * entity.radius * entity.radius };
		}
		case 'LWPOLYLINE':
		case 'POLYLINE': {
			if (!entity.shape || !entity.vertices || entity.vertices.length < 3) return null;
			const shape = new THREE.Shape();
			shape.moveTo(entity.vertices[0].x, entity.vertices[0].y);
			for (let i = 1; i < entity.vertices.length; i++) {
				shape.lineTo(entity.vertices[i].x, entity.vertices[i].y);
			}
			shape.closePath();
			return { shape, area: computeArea(entity.vertices) };
		}
		case 'ELLIPSE': {
			if (!entity.center || !entity.majorAxisEndPoint) return null;
			const startAngle = entity.startAngle || 0;
			const endAngle = entity.endAngle || Math.PI * 2;
			const isFullEllipse = Math.abs(endAngle - startAngle - Math.PI * 2) < 0.01 ||
				(startAngle === 0 && endAngle === 0);
			if (!isFullEllipse) return null;

			const majorRadius = Math.sqrt(entity.majorAxisEndPoint.x ** 2 + entity.majorAxisEndPoint.y ** 2);
			const minorRadius = majorRadius * entity.axisRatio;
			const rotation = Math.atan2(entity.majorAxisEndPoint.y, entity.majorAxisEndPoint.x);

			const ellipseCurve = new THREE.EllipseCurve(
				entity.center.x, entity.center.y,
				majorRadius, minorRadius,
				0, Math.PI * 2, false, rotation
			);
			const curvePoints = ellipseCurve.getPoints(64);
			const shape = new THREE.Shape();
			shape.moveTo(curvePoints[0].x, curvePoints[0].y);
			for (let i = 1; i < curvePoints.length; i++) {
				shape.lineTo(curvePoints[i].x, curvePoints[i].y);
			}
			shape.closePath();
			return { shape, area: Math.PI * majorRadius * minorRadius };
		}
		default:
			return null;
	}
}

/**
 * Compute total area of all inherently closed entities in a DXF file.
 * Returns total area in mm² (assuming DXF units are mm).
 */
export function computeTotalDXFArea(entities: any[]): number {
	let totalArea = 0;
	for (const entity of entities) {
		const closed = getClosedShapeFromEntity(entity);
		if (closed) {
			totalArea += closed.area;
		}
	}
	return totalArea;
}
