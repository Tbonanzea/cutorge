'use client';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useQuoting } from '@/context/quotingContext';
import {
	AlertCircle,
	CheckCircle2,
	Loader2,
	File as LucideFile,
	UploadCloud,
	X,
} from 'lucide-react';
import { useCallback, useState, useEffect, useRef } from 'react';
import { FileRejection, useDropzone } from 'react-dropzone';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;

function isDXF(file: File) {
	return (
		file.type === 'application/dxf' ||
		file.name.toLowerCase().endsWith('.dxf')
	);
}

function FileUploader() {
	const {
		cart,
		addItem,
		removeItem,
		clearCart,
		markStep,
	} = useQuoting();

	// Track blob URLs for cleanup
	const blobUrlsRef = useRef<Set<string>>(new Set());

	const [uploadProgress, setUploadProgress] = useState<number>(0);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadStatus, setUploadStatus] = useState<
		'idle' | 'success' | 'error'
	>('idle');
	const [uploadErrors, setUploadErrors] = useState<
		{ fileName: string; error: string }[]
	>([]);

	const onDropAccepted = useCallback(
		async (acceptedFiles: File[]) => {
			setIsUploading(true);
			setUploadProgress(0);
			setUploadStatus('idle');
			setUploadErrors([]);

			// Cleanup existing blob URLs before clearing cart
			blobUrlsRef.current.forEach((url) => {
				URL.revokeObjectURL(url);
			});
			blobUrlsRef.current.clear();

			clearCart();

			const newErrors: { fileName: string; error: string }[] = [];

			let processed = 0;
			for (const file of acceptedFiles) {
				// Valida tipo/mime y extensión
				if (!isDXF(file)) {
					newErrors.push({
						fileName: file.name,
						error: 'Solo archivos .dxf permitidos.',
					});
					continue;
				}

				// Simula upload y genera ID local (en prod lo traerías de la API)
				await new Promise((res) => setTimeout(res, 300));
				setUploadProgress(
					Math.round(((processed + 1) / acceptedFiles.length) * 100)
				);

				// Generate blob URL for preview
				const blobUrl = URL.createObjectURL(file);
				blobUrlsRef.current.add(blobUrl); // Track for cleanup

				// Crea un QuotingCartItem por archivo con blob URL y raw file
				const quotingFile = {
					id: crypto.randomUUID(),
					filename: file.name,
					filepath: '', // Will be set after S3 upload on submission
					filetype: 'DXF' as const,
					_rawFile: file, // Store raw File for later upload
					_blobUrl: blobUrl, // Blob URL for preview
				};
				addItem({
					file: quotingFile,
					material: null,
					materialType: null,
					quantity: 1,
					price: 0,
				});
				processed++;
			}
			setUploadErrors(newErrors);
			setUploadStatus(newErrors.length > 0 ? 'error' : 'success');
			setIsUploading(false);
			markStep(
				'file-upload',
				acceptedFiles.length - newErrors.length > 0
			);
		},
		[addItem, clearCart, markStep]
	);

	const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
		const rejections = fileRejections.flatMap((rejection) =>
			rejection.errors.map((error) => ({
				fileName: rejection.file.name,
				error: error.message,
			}))
		);
		setUploadErrors(rejections);
		setUploadStatus('error');
	}, []);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		accept: {
			'application/dxf': ['.dxf'],
		},
		maxSize: MAX_FILE_SIZE,
		multiple: true,
		maxFiles: MAX_FILES,
		onDropAccepted,
		onDropRejected,
		validator: (file) =>
			isDXF(file)
				? null
				: {
						code: 'invalid-type',
						message: 'Solo archivos .dxf permitidos.',
				  },
		disabled: isUploading,
	});

	const handleRemove = (index: number) => {
		// Cleanup blob URL before removing
		const item = cart.items[index];
		if (item?.file._blobUrl) {
			URL.revokeObjectURL(item.file._blobUrl);
			blobUrlsRef.current.delete(item.file._blobUrl);
		}
		removeItem(index);
	};

	// Note: We intentionally don't cleanup blob URLs on unmount because
	// they're still needed in subsequent steps (material selection, review)
	// The URLs will be cleaned up when:
	// 1. Individual items are removed (handleRemove)
	// 2. New files are uploaded (onDropAccepted)
	// 3. The browser tab is closed (automatic cleanup)

	return (
		<Card className='w-full max-w-3xl'>
			<CardHeader>
				<CardTitle>Subir archivos DXF</CardTitle>
				<CardDescription>
					Arrastra tus archivos DXF aquí o haz clic para seleccionar
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div
					{...getRootProps()}
					className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
						isDragActive
							? 'border-primary bg-primary/10'
							: 'border-muted-foreground/30 hover:border-primary/50'
					} ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}
				>
					<input {...getInputProps()} />
					<div className='flex flex-col items-center justify-center gap-4'>
						<UploadCloud className='h-12 w-12 text-muted-foreground' />
						<div>
							<p className='font-medium'>
								{isDragActive
									? 'Suelta tu archivo aquí...'
									: 'Arrastra y suelta tu archivo DXF aquí'}
							</p>
							<p className='text-sm text-muted-foreground mt-1'>
								Formatos aceptados: .dxf (Máx. {MAX_FILES}{' '}
								archivos, {MAX_FILE_SIZE / 1024 / 1024}MB cada
								uno)
							</p>
						</div>
						<Button variant='outline' className='mt-2'>
							Seleccionar archivos
						</Button>
					</div>
				</div>

				{/* Estado de carga/progreso */}
				{isUploading && (
					<div className='mt-6 space-y-4'>
						<div className='flex items-center justify-between'>
							<span className='text-sm font-medium'>
								Subiendo archivos...
							</span>
							<span className='text-sm text-muted-foreground'>
								{uploadProgress}%
							</span>
						</div>
						<Progress value={uploadProgress} className='h-2' />
						<div className='flex justify-center'>
							<Loader2 className='h-6 w-6 animate-spin text-primary' />
						</div>
					</div>
				)}

				{/* Archivos aceptados / subidos (cart.items) */}
				{cart.items.length > 0 && (
					<div className='mt-6'>
						<h4 className='font-medium mb-3'>
							Archivos seleccionados:
						</h4>
						<div className='space-y-2'>
							{cart.items.map((item, index) => (
								<div
									key={`${item.file.id}-${index}`}
									className='flex items-center p-3 border rounded-md bg-muted/50'
								>
									<LucideFile className='h-5 w-5 mr-3 text-blue-500 flex-shrink-0' />
									<div className='flex-1 min-w-0'>
										<p className='font-medium truncate'>
											{item.file.filename}
										</p>
										<p className='text-xs text-muted-foreground'>
											{item.file.filetype}
										</p>
									</div>
									<Button
										variant='ghost'
										size='icon'
										className='h-8 w-8'
										onClick={(e) => {
											e.stopPropagation();
											handleRemove(index);
										}}
									>
										<X className='h-4 w-4' />
									</Button>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Errores de subida */}
				{uploadErrors.length > 0 && (
					<div className='mt-6'>
						<h4 className='font-medium mb-3 flex items-center text-destructive'>
							<AlertCircle className='h-4 w-4 mr-2' />
							Errores durante la subida
						</h4>
						<div className='space-y-2'>
							{uploadErrors.map((error, index) => (
								<div
									key={`upload-error-${index}`}
									className='p-3 border rounded-md bg-destructive/10 border-destructive/30'
								>
									<div className='flex items-start'>
										<AlertCircle className='h-5 w-5 mr-3 text-destructive flex-shrink-0' />
										<div>
											<p className='font-medium'>
												{error.fileName}
											</p>
											<p className='text-sm text-destructive mt-1'>
												{error.error}
											</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Estado de resultado */}
				{uploadStatus !== 'idle' && !isUploading && (
					<div className='mt-6'>
						<div
							className={`flex items-center p-4 rounded-md ${
								uploadStatus === 'error'
									? 'bg-destructive/10 text-destructive'
									: 'bg-green-100 text-green-700'
							}`}
						>
							{uploadStatus === 'error' ? (
								<AlertCircle className='h-6 w-6 mr-3' />
							) : (
								<CheckCircle2 className='h-6 w-6 mr-3' />
							)}
							<div>
								<p className='font-medium'>
									{uploadStatus === 'error'
										? 'Error en la subida'
										: '¡Subida completada!'}
								</p>
								<p className='text-sm'>
									{uploadStatus === 'error'
										? 'Algunos archivos no pudieron subirse'
										: 'Todos los archivos se subieron correctamente'}
								</p>
							</div>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export default FileUploader;
