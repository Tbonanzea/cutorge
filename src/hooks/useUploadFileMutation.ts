'use client';

import { useMutation } from '@tanstack/react-query';

async function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const dataUrl = reader.result as string;
			// dataUrl incluye algo como "data:application/dxf;base64,AAA..."
			// Nos quedamos sólo con la parte base64 (después de la coma)
			const base64 = dataUrl.split(',')[1];
			resolve(base64);
		};
		reader.onerror = (error) => reject(error);
		reader.readAsDataURL(file);
	});
}

async function uploadFile(file: File): Promise<Response> {
	// 1. Convertimos el archivo a base64
	const base64Content = await fileToBase64(file);

	// 2. Subimos el archivo a /api/file
	const response = await fetch('/api/file', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			fileName: file.name,
			fileContent: base64Content,
			contentType: 'application/dxf', // ajusta según tu caso
		}),
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Error uploading file: ${errorText}`);
	}

	return response.json();
}

export function useUploadFileMutation() {
	return useMutation({ mutationFn: (file: File) => uploadFile(file) });
}
