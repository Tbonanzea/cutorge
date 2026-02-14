/**
 * De Boor B-spline evaluation algorithm.
 * No external dependencies — pure TypeScript implementation.
 */

interface Point3D {
	x: number;
	y: number;
	z: number;
}

/**
 * Find the knot span index for parameter t using binary search.
 * Returns the index i such that knots[i] <= t < knots[i+1].
 */
function findKnotSpan(t: number, degree: number, knots: number[], n: number): number {
	// n = number of control points - 1
	// Special case: t at the end of the knot vector
	if (t >= knots[n + 1]) return n;
	if (t <= knots[degree]) return degree;

	let low = degree;
	let high = n + 1;
	let mid = Math.floor((low + high) / 2);

	while (t < knots[mid] || t >= knots[mid + 1]) {
		if (t < knots[mid]) {
			high = mid;
		} else {
			low = mid;
		}
		mid = Math.floor((low + high) / 2);
	}

	return mid;
}

/**
 * Evaluate a B-spline at parameter t using the De Boor algorithm.
 *
 * @param t - Parameter value
 * @param degree - Degree of the spline curve
 * @param controlPoints - Array of control points {x, y, z}
 * @param knots - Knot vector
 * @returns Evaluated point {x, y, z}
 */
export function evaluateBSpline(
	t: number,
	degree: number,
	controlPoints: Point3D[],
	knots: number[]
): Point3D {
	const n = controlPoints.length - 1;

	// Clamp t to valid range
	const tMin = knots[degree];
	const tMax = knots[n + 1];
	t = Math.max(tMin, Math.min(tMax, t));

	const span = findKnotSpan(t, degree, knots, n);

	// Initialize with control points in the relevant span
	const d: Point3D[] = [];
	for (let j = 0; j <= degree; j++) {
		const idx = span - degree + j;
		const cp = controlPoints[Math.max(0, Math.min(n, idx))];
		d[j] = { x: cp.x, y: cp.y, z: cp.z };
	}

	// De Boor recursion
	for (let r = 1; r <= degree; r++) {
		for (let j = degree; j >= r; j--) {
			const left = span - degree + j;
			const knotLeft = knots[left];
			const knotRight = knots[left + degree - r + 1];
			const denom = knotRight - knotLeft;

			if (Math.abs(denom) < 1e-10) {
				// Knot multiplicity — keep current point
				continue;
			}

			const alpha = (t - knotLeft) / denom;
			d[j] = {
				x: (1 - alpha) * d[j - 1].x + alpha * d[j].x,
				y: (1 - alpha) * d[j - 1].y + alpha * d[j].y,
				z: (1 - alpha) * d[j - 1].z + alpha * d[j].z,
			};
		}
	}

	return d[degree];
}

/**
 * Generate an array of sampled points along a B-spline curve.
 *
 * @param degree - Degree of the spline curve
 * @param controlPoints - Array of control points {x, y, z}
 * @param knots - Knot vector
 * @param numPoints - Number of points to sample (default: controlPoints.length * 10)
 * @returns Array of evaluated points
 */
export function evaluateBSplineCurve(
	degree: number,
	controlPoints: Point3D[],
	knots: number[],
	numPoints?: number
): Point3D[] {
	const n = controlPoints.length - 1;
	const samples = numPoints ?? Math.max(50, controlPoints.length * 10);

	const tMin = knots[degree];
	const tMax = knots[n + 1];

	const points: Point3D[] = [];
	for (let i = 0; i <= samples; i++) {
		const t = tMin + (i / samples) * (tMax - tMin);
		points.push(evaluateBSpline(t, degree, controlPoints, knots));
	}

	return points;
}

/**
 * Get the start point of a B-spline curve.
 */
export function getBSplineStartPoint(
	degree: number,
	controlPoints: Point3D[],
	knots: number[]
): Point3D {
	const tMin = knots[degree];
	return evaluateBSpline(tMin, degree, controlPoints, knots);
}

/**
 * Get the end point of a B-spline curve.
 */
export function getBSplineEndPoint(
	degree: number,
	controlPoints: Point3D[],
	knots: number[]
): Point3D {
	const n = controlPoints.length - 1;
	const tMax = knots[n + 1];
	return evaluateBSpline(tMax, degree, controlPoints, knots);
}
