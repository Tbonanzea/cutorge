import * as THREE from 'three';
import { Line2, LineGeometry, LineMaterial } from 'three-stdlib';

interface CreateCustomGridOptions {
	pieceBounds: { width: number; height: number }; // Piece dimensions in DXF units (mm)
	cellSize?: number; // Size of each grid cell in DXF units (default: 10mm = 1cm)
	paddingMultiplier?: number; // How far beyond the piece to extend the grid (default: 2.0)
	minExtension?: number; // Minimum extension per side in DXF units (default: 300mm = 30cm)
}

interface CreatePackageBoundaryOptions {
	width: number; // Package width in DXF units (mm)
	height: number; // Package height in DXF units (mm)
	resolution: THREE.Vector2; // Screen resolution for LineMaterial
}

/**
 * Creates a custom grid that dynamically sizes based on the piece dimensions.
 * Uses BufferGeometry + LineSegments for efficient rendering.
 *
 * @param options Grid configuration
 * @returns THREE.Group containing minor and major grid lines
 */
export function createCustomGrid(options: CreateCustomGridOptions): THREE.Group {
	const {
		pieceBounds,
		cellSize = 10, // 10mm = 1cm per cell
		paddingMultiplier = 2.0,
		minExtension = 300, // 30cm minimum
	} = options;

	const group = new THREE.Group();

	// Calculate grid extents - extend beyond piece bounds
	const extension = Math.max(
		Math.max(pieceBounds.width, pieceBounds.height) * paddingMultiplier,
		minExtension
	);

	const halfWidth = pieceBounds.width / 2 + extension;
	const halfHeight = pieceBounds.height / 2 + extension;

	// Snap to grid cells
	const minX = -Math.ceil(halfWidth / cellSize) * cellSize;
	const maxX = Math.ceil(halfWidth / cellSize) * cellSize;
	const minY = -Math.ceil(halfHeight / cellSize) * cellSize;
	const maxY = Math.ceil(halfHeight / cellSize) * cellSize;

	// Generate grid lines
	const minorLines: number[] = [];
	const majorLines: number[] = [];

	// Vertical lines
	for (let x = minX; x <= maxX; x += cellSize) {
		const isMajor = Math.abs(x % (cellSize * 10)) < 0.01; // Every 10 cells = 10cm
		const lines = isMajor ? majorLines : minorLines;
		lines.push(x, minY, 0, x, maxY, 0);
	}

	// Horizontal lines
	for (let y = minY; y <= maxY; y += cellSize) {
		const isMajor = Math.abs(y % (cellSize * 10)) < 0.01; // Every 10 cells = 10cm
		const lines = isMajor ? majorLines : minorLines;
		lines.push(minX, y, 0, maxX, y, 0);
	}

	// Create minor grid lines (light gray)
	if (minorLines.length > 0) {
		const minorGeometry = new THREE.BufferGeometry();
		minorGeometry.setAttribute(
			'position',
			new THREE.Float32BufferAttribute(minorLines, 3)
		);
		const minorMaterial = new THREE.LineBasicMaterial({
			color: 0xe0e0e0,
			transparent: true,
			opacity: 0.3,
		});
		const minorLineSegments = new THREE.LineSegments(minorGeometry, minorMaterial);
		group.add(minorLineSegments);
	}

	// Create major grid lines (medium gray)
	if (majorLines.length > 0) {
		const majorGeometry = new THREE.BufferGeometry();
		majorGeometry.setAttribute(
			'position',
			new THREE.Float32BufferAttribute(majorLines, 3)
		);
		const majorMaterial = new THREE.LineBasicMaterial({
			color: 0xcccccc,
			transparent: true,
			opacity: 0.5,
		});
		const majorLineSegments = new THREE.LineSegments(majorGeometry, majorMaterial);
		group.add(majorLineSegments);
	}

	return group;
}

/**
 * Creates a package boundary rectangle centered at the origin.
 * Uses Line2 + LineMaterial from three-stdlib for wider lines (>1px).
 *
 * @param options Boundary configuration
 * @returns Line2 object representing the package boundary
 */
export function createPackageBoundary(options: CreatePackageBoundaryOptions): Line2 {
	const { width, height, resolution } = options;

	// Create rectangle points centered at origin
	const halfWidth = width / 2;
	const halfHeight = height / 2;

	const points = [
		-halfWidth, -halfHeight, 0,
		halfWidth, -halfHeight, 0,
		halfWidth, halfHeight, 0,
		-halfWidth, halfHeight, 0,
		-halfWidth, -halfHeight, 0, // Close the rectangle
	];

	const geometry = new LineGeometry();
	geometry.setPositions(points);

	const material = new LineMaterial({
		color: 0xff6b35, // Orange
		linewidth: 3, // 3px
		resolution: resolution,
		worldUnits: false, // Use screen-space line width
	});

	return new Line2(geometry, material);
}
