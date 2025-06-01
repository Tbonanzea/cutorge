'use client';
import { useUploadFileMutation } from '@/hooks/useUploadFileMutation';
import { MAX_FILE_SIZE, MAX_FILES } from '@/lib/utils/constants';
import React, { useCallback } from 'react';
import { FileRejection, useDropzone } from 'react-dropzone';

function FileUploader() {
	const {
		mutateAsync: uploadFile,
		isPending,
		isError,
		isSuccess,
	} = useUploadFileMutation();

	const onDropAccepted = useCallback(
		(acceptedFiles: File[]) => {
			acceptedFiles.forEach(async (file: File) => {
				console.log('Archivo aceptado:', file);
				try {
					await uploadFile(file);
					console.log('Archivo subido con éxito');
				} catch (error) {
					console.error(error);
				}
			});
		},
		[uploadFile]
	);

	// Se ejecuta cuando los archivos son rechazados (por formato o por tamaño).
	const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
		fileRejections.forEach((rejection: FileRejection) => {
			console.error('Archivo rechazado:', rejection.file.name);
			rejection.errors.forEach((err) => {
				console.error(err.message);
			});
		});
	}, []);

	const customValidator = useCallback((file: File) => {
		// Validar que sea un dxf bien formateado

		// Ejemplo de error personalizado
		/*
		return {
			code: 'archivo-invalidado-por-nombre',
			message: 'El archivo contiene la palabra "test" en su nombre.',
		} as FileError;
	   */

		return null; // null significa que el archivo es válido
	}, []);

	const {
		getRootProps,
		getInputProps,
		isDragActive,
		acceptedFiles,
		fileRejections,
	} = useDropzone({
		accept: {
			'application/dxf': ['.dxf'], // Aceptamos únicamente archivos con extensión .dxf
		},
		maxSize: MAX_FILE_SIZE, // Tamaño máximo de archivo: 5 MB
		multiple: true,
		maxFiles: MAX_FILES,
		onDropAccepted,
		onDropRejected,
		validator: customValidator,
	});

	return (
		<div
			{...getRootProps()}
			className='hover:underline'
			style={{
				border: '2px dashed #ccc',
				padding: '20px',
				textAlign: 'center',
				cursor: 'pointer',
				backgroundColor: isDragActive ? '#f0f0f0' : 'white',
			}}
		>
			<input {...getInputProps()} />
			{isDragActive ? (
				<p>Suelta tu archivo DXF aquí...</p>
			) : (
				<p>
					Arrastra y suelta tu archivo DXF, o haz clic para
					seleccionar
				</p>
			)}

			{/* Opcional: Mostrar la lista de archivos aceptados */}
			{acceptedFiles.length > 0 && (
				<div style={{ marginTop: '1rem', color: 'green' }}>
					<h4>Archivos aceptados:</h4>
					<ul>
						{acceptedFiles.map((file) => (
							<li key={file.path || file.name}>
								{file.path || file.name}
							</li>
						))}
					</ul>
				</div>
			)}

			{/* Opcional: Mostrar la lista de archivos rechazados y sus motivos */}
			{fileRejections.length > 0 && (
				<div style={{ marginTop: '1rem', color: 'red' }}>
					<h4>Archivos rechazados:</h4>
					<ul>
						{fileRejections.map(({ file, errors }) => (
							<li key={file.path || file.name}>
								{file.name} -{' '}
								{(file.size / 1024 / 1024).toFixed(2)} MB
								<ul>
									{errors.map((e) => (
										<li key={e.code}>{e.message}</li>
									))}
								</ul>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}

export default FileUploader;
