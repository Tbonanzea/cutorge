declare module 'three-dxf-viewer' {
	import * as THREE from 'three';

	export class DXFViewer {
		layers: any;
		unit: number;
		lastDXF: any;
		DefaultTextHeight: number;
		DefaultTextScale: number;
		useCache: boolean;

		constructor();

		getFromFile(file: File, font?: string): Promise<THREE.Group>;
		getFromPath(path: string, font?: string): Promise<THREE.Group>;
	}

	export const UNITS: {
		[key: string]: { [key: number]: string };
	};
}
