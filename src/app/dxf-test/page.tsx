'use client';

import dynamic from 'next/dynamic';

const DXFViewer2D = dynamic(() => import('@/components/DXFViewer2D'), { ssr: false });
const DXFViewer3D = dynamic(() => import('@/components/DXFViewer3D'), { ssr: false });

export default function DXFTestPage() {
	return (
		<div className="min-h-screen bg-gray-950 p-4">
			<h1 className="mb-4 text-xl font-bold text-white">DXF Viewer Test</h1>
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<div>
					<h2 className="mb-2 text-sm font-medium text-gray-400">2D View</h2>
					<div className="h-[600px] rounded-lg border border-gray-800">
						<DXFViewer2D showControls={true} />
					</div>
				</div>
				<div>
					<h2 className="mb-2 text-sm font-medium text-gray-400">3D View (thickness: 3mm)</h2>
					<div className="h-[600px] rounded-lg border border-gray-800">
						<DXFViewer3D showControls={true} thickness={3} />
					</div>
				</div>
			</div>
		</div>
	);
}
