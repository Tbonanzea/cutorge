import * as THREE from 'three';
import { evaluateBSplineCurve } from './bspline';

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
 * Compute signed 2D polygon area using the shoelace formula.
 * Positive = CCW (interior face), Negative = CW (exterior/unbounded face).
 */
function signedArea(points: { x: number; y: number }[]): number {
	let area = 0;
	for (let i = 0; i < points.length; i++) {
		const j = (i + 1) % points.length;
		area += points[i].x * points[j].y;
		area -= points[j].x * points[i].y;
	}
	return area / 2;
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
		case 'SPLINE': {
			if (!entity.closed || !entity.controlPoints || entity.controlPoints.length < 3) return null;
			let pts: { x: number; y: number }[];
			if (entity.knotValues && entity.knotValues.length > 0 && entity.degreeOfSplineCurve) {
				const cp = entity.controlPoints.map((p: any) => ({ x: p.x, y: p.y, z: p.z || 0 }));
				const evaluated = evaluateBSplineCurve(entity.degreeOfSplineCurve, cp, entity.knotValues);
				pts = evaluated.map((p) => ({ x: p.x, y: p.y }));
			} else {
				pts = entity.controlPoints.map((p: any) => ({ x: p.x, y: p.y }));
			}
			if (pts.length < 3) return null;
			const shape = new THREE.Shape();
			shape.moveTo(pts[0].x, pts[0].y);
			for (let i = 1; i < pts.length; i++) {
				shape.lineTo(pts[i].x, pts[i].y);
			}
			shape.closePath();
			return { shape, area: computeArea(pts) };
		}
		default:
			return null;
	}
}

// ---------------------------------------------------------------------------
// Contour chaining types and helpers
// ---------------------------------------------------------------------------

interface Point2D {
	x: number;
	y: number;
}

interface Segment {
	points: Point2D[];
	startPoint: Point2D;
	endPoint: Point2D;
	isClosed: boolean;
}

/**
 * Expand a bulge arc between two polyline vertices into intermediate points.
 * Bulge = tan(1/4 of the included angle). Positive bulge = CCW arc, negative = CW.
 */
function expandBulge(v1: Point2D, v2: Point2D, bulge: number, numSegments: number = 16): Point2D[] {
	const dx = v2.x - v1.x;
	const dy = v2.y - v1.y;
	const chordLen = Math.sqrt(dx * dx + dy * dy);
	if (chordLen < 1e-10) return [v1, v2];

	const sagitta = Math.abs(bulge) * chordLen / 2;
	const radius = (chordLen * chordLen / 4 + sagitta * sagitta) / (2 * sagitta);

	// Midpoint of the chord
	const mx = (v1.x + v2.x) / 2;
	const my = (v1.y + v2.y) / 2;

	// Normal to chord (pointing toward arc center)
	const nx = -dy / chordLen;
	const ny = dx / chordLen;

	// Distance from midpoint to center along normal
	const dist = radius - sagitta;
	const sign = bulge > 0 ? 1 : -1;
	const cx = mx + sign * dist * nx;
	const cy = my + sign * dist * ny;

	// Angles from center to v1 and v2
	const startAngle = Math.atan2(v1.y - cy, v1.x - cx);
	const endAngle = Math.atan2(v2.y - cy, v2.x - cx);

	// Included angle: bulge = tan(includedAngle / 4)
	const includedAngle = 4 * Math.atan(Math.abs(bulge));

	const points: Point2D[] = [];
	for (let i = 0; i <= numSegments; i++) {
		const t = i / numSegments;
		let angle: number;
		if (bulge > 0) {
			// CCW arc
			angle = startAngle + t * includedAngle;
		} else {
			// CW arc
			angle = startAngle - t * includedAngle;
		}
		points.push({
			x: cx + radius * Math.cos(angle),
			y: cy + radius * Math.sin(angle),
		});
	}
	return points;
}

/**
 * Convert a DXF entity into a Segment with sampled points and start/end info.
 */
function entityToSegment(entity: any): Segment | null {
	switch (entity.type) {
		case 'LINE': {
			if (!entity.vertices || entity.vertices.length < 2) return null;
			const p0: Point2D = { x: entity.vertices[0].x, y: entity.vertices[0].y };
			const p1: Point2D = { x: entity.vertices[1].x, y: entity.vertices[1].y };
			return { points: [p0, p1], startPoint: p0, endPoint: p1, isClosed: false };
		}

		case 'ARC': {
			if (!entity.center || !entity.radius) return null;
			const { center, radius } = entity;
			const sa = entity.startAngle ?? 0;
			const ea = entity.endAngle ?? 0;

			// Compute sweep (DXF arcs go CCW from startAngle to endAngle)
			let sweep = ea - sa;
			if (sweep <= 1e-10) sweep += 2 * Math.PI;

			const isFull = Math.abs(sweep - 2 * Math.PI) < 0.01;
			const numPts = isFull ? 64 : 32;
			const points: Point2D[] = [];
			for (let i = 0; i <= numPts; i++) {
				const angle = sa + (i / numPts) * sweep;
				points.push({
					x: center.x + radius * Math.cos(angle),
					y: center.y + radius * Math.sin(angle),
				});
			}
			return {
				points,
				startPoint: points[0],
				endPoint: points[points.length - 1],
				isClosed: isFull,
			};
		}

		case 'CIRCLE': {
			if (!entity.center || !entity.radius) return null;
			const { center, radius } = entity;
			const points: Point2D[] = [];
			const numPts = 64;
			for (let i = 0; i <= numPts; i++) {
				const angle = (i / numPts) * 2 * Math.PI;
				points.push({
					x: center.x + radius * Math.cos(angle),
					y: center.y + radius * Math.sin(angle),
				});
			}
			return { points, startPoint: points[0], endPoint: points[points.length - 1], isClosed: true };
		}

		case 'ELLIPSE': {
			if (!entity.center || !entity.majorAxisEndPoint) return null;
			const majorRadius = Math.sqrt(entity.majorAxisEndPoint.x ** 2 + entity.majorAxisEndPoint.y ** 2);
			const minorRadius = majorRadius * (entity.axisRatio ?? 1);
			const rotation = Math.atan2(entity.majorAxisEndPoint.y, entity.majorAxisEndPoint.x);

			const sa = entity.startAngle ?? 0;
			const ea = entity.endAngle ?? Math.PI * 2;
			const isFull = Math.abs(ea - sa - Math.PI * 2) < 0.01 || (sa === 0 && ea === 0);

			const sweep = isFull ? Math.PI * 2 : (ea - sa > 0 ? ea - sa : ea - sa + Math.PI * 2);
			const numPts = isFull ? 64 : 32;
			const points: Point2D[] = [];
			for (let i = 0; i <= numPts; i++) {
				const t = sa + (i / numPts) * sweep;
				// Parametric ellipse point, then rotate
				const px = majorRadius * Math.cos(t);
				const py = minorRadius * Math.sin(t);
				points.push({
					x: entity.center.x + px * Math.cos(rotation) - py * Math.sin(rotation),
					y: entity.center.y + px * Math.sin(rotation) + py * Math.cos(rotation),
				});
			}
			return {
				points,
				startPoint: points[0],
				endPoint: points[points.length - 1],
				isClosed: isFull,
			};
		}

		case 'LWPOLYLINE':
		case 'POLYLINE': {
			if (!entity.vertices || entity.vertices.length < 2) return null;
			const isClosed = !!entity.shape;
			const verts: any[] = entity.vertices;

			// Number of edges: all pairs for closed, verts.length-1 for open
			const edgeCount = isClosed ? verts.length : verts.length - 1;

			const points: Point2D[] = [];
			for (let i = 0; i < edgeCount; i++) {
				const v = verts[i];
				const vNext = verts[(i + 1) % verts.length];

				if (v.bulge && Math.abs(v.bulge) > 1e-6) {
					const bulgePoints = expandBulge(
						{ x: v.x, y: v.y },
						{ x: vNext.x, y: vNext.y },
						v.bulge
					);
					// Skip first point if we already have points (avoid duplicate at junction)
					const startIdx = points.length === 0 ? 0 : 1;
					for (let j = startIdx; j < bulgePoints.length; j++) {
						points.push(bulgePoints[j]);
					}
				} else {
					if (points.length === 0) {
						points.push({ x: v.x, y: v.y });
					}
					points.push({ x: vNext.x, y: vNext.y });
				}
			}

			// For open polylines, if we have no edges (single vertex), add it
			if (points.length === 0 && verts.length >= 1) {
				points.push({ x: verts[0].x, y: verts[0].y });
			}

			if (points.length < 2) return null;
			return {
				points,
				startPoint: points[0],
				endPoint: points[points.length - 1],
				isClosed,
			};
		}

		case 'SPLINE': {
			if (!entity.controlPoints || entity.controlPoints.length < 2) return null;
			const isClosed = !!entity.closed;
			let pts: Point2D[];

			if (entity.knotValues && entity.knotValues.length > 0 && entity.degreeOfSplineCurve) {
				const cp = entity.controlPoints.map((p: any) => ({ x: p.x, y: p.y, z: p.z || 0 }));
				const evaluated = evaluateBSplineCurve(entity.degreeOfSplineCurve, cp, entity.knotValues);
				pts = evaluated.map((p) => ({ x: p.x, y: p.y }));
			} else {
				pts = entity.controlPoints.map((p: any) => ({ x: p.x, y: p.y }));
			}

			if (pts.length < 2) return null;
			return {
				points: pts,
				startPoint: pts[0],
				endPoint: pts[pts.length - 1],
				isClosed,
			};
		}

		default:
			return null;
	}
}

/**
 * Distance between two 2D points.
 */
function dist2D(a: Point2D, b: Point2D): number {
	const dx = a.x - b.x;
	const dy = a.y - b.y;
	return Math.sqrt(dx * dx + dy * dy);
}

// ---------------------------------------------------------------------------
// Planar graph face traversal for correct contour extraction
// ---------------------------------------------------------------------------

/** Directed edge in the planar graph */
interface DirectedEdge {
	from: number;     // node index
	to: number;       // node index
	points: Point2D[]; // sampled points along this edge (from → to)
	angle: number;     // outgoing angle from 'from' node
	visited: boolean;
}

/**
 * Merge nearby points into unique nodes.
 * Returns mapping from original point index to node index.
 */
function buildNodes(endpoints: Point2D[], tolerance: number): { nodes: Point2D[]; pointToNode: number[] } {
	const nodes: Point2D[] = [];
	const pointToNode: number[] = [];

	for (let i = 0; i < endpoints.length; i++) {
		let found = -1;
		for (let j = 0; j < nodes.length; j++) {
			if (dist2D(endpoints[i], nodes[j]) < tolerance) {
				found = j;
				break;
			}
		}
		if (found >= 0) {
			pointToNode.push(found);
		} else {
			pointToNode.push(nodes.length);
			nodes.push({ x: endpoints[i].x, y: endpoints[i].y });
		}
	}

	return { nodes, pointToNode };
}

/**
 * Compute the outgoing angle of an edge from a node.
 */
function outgoingAngle(from: Point2D, to: Point2D): number {
	return Math.atan2(to.y - from.y, to.x - from.x);
}

/**
 * Build a planar graph from segments and extract all faces using face traversal.
 * Returns arrays of points representing closed contours (faces of the graph).
 */
function extractFaces(segments: Segment[], tolerance: number = 0.5): Point2D[][] {
	// Convert closed segments into two open halves so they participate in the
	// planar graph.  This ensures holes (circles, closed polylines) inside the
	// outer boundary are correctly handled by face traversal.
	const graphSegments: Segment[] = [];

	for (const seg of segments) {
		if (seg.isClosed && seg.points.length >= 4) {
			const mid = Math.floor(seg.points.length / 2);
			const firstHalf = seg.points.slice(0, mid + 1);
			const secondHalf = seg.points.slice(mid);
			graphSegments.push({
				points: firstHalf,
				startPoint: firstHalf[0],
				endPoint: firstHalf[firstHalf.length - 1],
				isClosed: false,
			});
			graphSegments.push({
				points: secondHalf,
				startPoint: secondHalf[0],
				endPoint: secondHalf[secondHalf.length - 1],
				isClosed: false,
			});
		} else {
			graphSegments.push(seg);
		}
	}

	const openSegments = graphSegments.filter(s => !s.isClosed);

	if (openSegments.length === 0) return [];

	// Collect all endpoints
	const allEndpoints: Point2D[] = [];
	for (const seg of openSegments) {
		allEndpoints.push(seg.startPoint);
		allEndpoints.push(seg.endPoint);
	}

	// Merge endpoints into nodes
	const { nodes, pointToNode } = buildNodes(allEndpoints, tolerance);

	// Build directed edges (each segment creates two directed edges)
	const edges: DirectedEdge[] = [];
	// Map: nodeIndex → list of edge indices leaving this node
	const nodeEdges: number[][] = Array.from({ length: nodes.length }, () => []);

	for (let i = 0; i < openSegments.length; i++) {
		const seg = openSegments[i];
		const fromNode = pointToNode[i * 2];
		const toNode = pointToNode[i * 2 + 1];

		if (fromNode === toNode) continue; // skip degenerate segments

		// Use the second point for angle (more accurate for curves)
		const fwdAnglePt = seg.points.length > 1 ? seg.points[1] : seg.endPoint;
		const revAnglePt = seg.points.length > 1 ? seg.points[seg.points.length - 2] : seg.startPoint;

		// Forward edge: from → to
		const fwdIdx = edges.length;
		edges.push({
			from: fromNode,
			to: toNode,
			points: [...seg.points],
			angle: outgoingAngle(nodes[fromNode], fwdAnglePt),
			visited: false,
		});
		nodeEdges[fromNode].push(fwdIdx);

		// Reverse edge: to → from
		const revIdx = edges.length;
		edges.push({
			from: toNode,
			to: fromNode,
			points: [...seg.points].reverse(),
			angle: outgoingAngle(nodes[toNode], revAnglePt),
			visited: false,
		});
		nodeEdges[toNode].push(revIdx);
	}

	// Sort edges at each node by angle (CCW)
	for (let n = 0; n < nodes.length; n++) {
		nodeEdges[n].sort((a, b) => edges[a].angle - edges[b].angle);
	}

	// Build the "next edge" mapping for face traversal:
	// For directed edge (u→v), the next edge in the same face is found by:
	// At node v, find the reverse edge (v→u), then take the NEXT edge in CW order
	// (which is the PREVIOUS edge in CCW-sorted order).
	const twinOf = (edgeIdx: number) => edgeIdx ^ 1; // forward/reverse are always stored in pairs

	const nextInFace = new Array(edges.length).fill(-1);
	for (let eIdx = 0; eIdx < edges.length; eIdx++) {
		const twin = twinOf(eIdx); // twin is the reverse edge
		const v = edges[eIdx].to;  // we arrive at node v

		const edgesAtV = nodeEdges[v];
		// Find the position of the twin (v→u) in the sorted edge list at v
		const twinPos = edgesAtV.indexOf(twin);
		if (twinPos < 0) continue;

		// Next edge in the face = previous in CCW order (= CW direction from twin)
		const nextPos = (twinPos - 1 + edgesAtV.length) % edgesAtV.length;
		nextInFace[eIdx] = edgesAtV[nextPos];
	}

	// Trace all faces
	const faces: Point2D[][] = [];
	for (let startEdge = 0; startEdge < edges.length; startEdge++) {
		if (edges[startEdge].visited) continue;

		const facePoints: Point2D[] = [];
		let current = startEdge;
		let safetyCounter = 0;
		const maxIterations = edges.length + 1;

		while (!edges[current].visited && safetyCounter < maxIterations) {
			edges[current].visited = true;
			// Add all points except the last one (it's the start of the next edge)
			const pts = edges[current].points;
			for (let p = 0; p < pts.length - 1; p++) {
				facePoints.push(pts[p]);
			}

			const next = nextInFace[current];
			if (next < 0) break;
			current = next;
			safetyCounter++;
		}

		if (facePoints.length >= 3) {
			faces.push(facePoints);
		}
	}

	return faces;
}

/**
 * Expand INSERT entities by replacing them with their block's entities.
 * Handles position offset from the INSERT entity.
 */
function expandInserts(entities: any[], blocks?: Record<string, any>): any[] {
	if (!blocks) return entities;

	const expanded: any[] = [];
	for (const entity of entities) {
		if (entity.type === 'INSERT' && entity.name && blocks[entity.name]) {
			const block = blocks[entity.name];
			if (block.entities) {
				const ox = entity.position?.x || 0;
				const oy = entity.position?.y || 0;

				for (const bEntity of block.entities) {
					// Clone entity and offset coordinates
					const clone = JSON.parse(JSON.stringify(bEntity));

					if (clone.vertices) {
						for (const v of clone.vertices) {
							v.x += ox;
							v.y += oy;
						}
					}
					if (clone.center) {
						clone.center.x += ox;
						clone.center.y += oy;
					}
					if (clone.position) {
						clone.position.x += ox;
						clone.position.y += oy;
					}
					if (clone.controlPoints) {
						for (const cp of clone.controlPoints) {
							cp.x += ox;
							cp.y += oy;
						}
					}

					expanded.push(clone);
				}
			}
		} else {
			expanded.push(entity);
		}
	}
	return expanded;
}

/**
 * Compute total area of a DXF file by extracting contours using planar graph
 * face traversal. Returns the area of the largest (outer) contour.
 * Returns area in mm² (assuming DXF units are mm).
 *
 * @param entities - Array of DXF entities
 * @param blocks - Optional blocks object for expanding INSERT entities
 */
export function computeTotalDXFArea(entities: any[], blocks?: Record<string, any>): number {
	// Expand INSERT entities if blocks are provided
	const expandedEntities = expandInserts(entities, blocks);

	// Convert all entities to segments
	const segments: Segment[] = [];
	for (const entity of expandedEntities) {
		const seg = entityToSegment(entity);
		if (seg) {
			segments.push(seg);
		}
	}

	if (segments.length === 0) return 0;

	// Extract all faces (contours) using planar graph traversal
	const contours = extractFaces(segments);

	if (contours.length === 0) return 0;

	// Use signed area to find the outer contour.
	// In the planar face traversal, interior faces (CCW) have positive signed area,
	// while the unbounded outer face (CW) has negative signed area.
	// The outer contour of the shape is the largest POSITIVE signed area face.
	let maxPositiveArea = 0;
	let maxAbsArea = 0;
	for (let i = 0; i < contours.length; i++) {
		const sa = signedArea(contours[i]);
		if (sa > maxPositiveArea) {
			maxPositiveArea = sa;
		}
		const absA = Math.abs(sa);
		if (absA > maxAbsArea) {
			maxAbsArea = absA;
		}
	}

	// Prefer the largest positive (CCW) area. If none found, fall back to absolute.
	return maxPositiveArea > 0 ? maxPositiveArea : maxAbsArea;
}
