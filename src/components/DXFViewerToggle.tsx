'use client';

import { useState } from 'react';
import DXFViewerSimple from './DXFViewer2D';
import DXFViewer3D from './DXFViewer3D';
import { Button } from './ui/button';

interface DXFViewerToggleProps {
	dxfUrl?: string;
	className?: string;
}

type ViewMode = '2D' | '3D';

export default function DXFViewerToggle({
	dxfUrl,
	className = '',
}: DXFViewerToggleProps) {
	const [viewMode, setViewMode] = useState<ViewMode>('2D');

	if (!dxfUrl) {
		return (
			<div
				className={`flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 ${className}`}
			>
				<p className='text-sm text-gray-500'>
					No se pudo cargar la vista previa del archivo
				</p>
			</div>
		);
	}

	return (
		<div className={`flex flex-col gap-3 ${className}`}>
			{/* Toggle Buttons */}
			<div className='flex gap-2 items-center justify-center'>
				<Button
					variant={viewMode === '2D' ? 'default' : 'outline'}
					size='sm'
					onClick={() => setViewMode('2D')}
					className='min-w-[80px]'
				>
					2D View
				</Button>
				<Button
					variant={viewMode === '3D' ? 'default' : 'outline'}
					size='sm'
					onClick={() => setViewMode('3D')}
					className='min-w-[80px]'
				>
					3D View
				</Button>
			</div>

			{/* Viewer Container */}
			<div className='w-full'>
				{viewMode === '2D' ? (
					<DXFViewerSimple
						dxfUrl={dxfUrl}
						className='w-full'
						showControls={false}
					/>
				) : (
					<DXFViewer3D
						dxfUrl={dxfUrl}
						className='w-full'
						showControls={false}
					/>
				)}
			</div>
		</div>
	);
}
