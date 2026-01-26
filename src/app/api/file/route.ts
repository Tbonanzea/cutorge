import {
	GetObjectCommand,
	GetObjectCommandOutput,
	ListObjectsV2Command,
	ListObjectsV2CommandOutput,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { Readable } from 'stream';

const s3Client = new S3Client({
	region: process.env.AWS_REGION,
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
	},
});

async function streamToBuffer(stream: Readable): Promise<Buffer> {
	const chunks: Uint8Array[] = [];
	for await (const chunk of stream) {
		chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
	}
	return Buffer.concat(chunks);
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const key = searchParams.get('key');

	if (key) {
		// GET un único objeto
		try {
			const command = new GetObjectCommand({
				Bucket: process.env.AWS_S3_BUCKET_NAME,
				Key: key,
			});
			const data: GetObjectCommandOutput = await s3Client.send(command);
			/**
			 * data.Body será un ReadableStream (Node.js Readable) o undefined
			 * en el entorno de ejecución Node. Convertimos a Buffer para devolverlo.
			 */
			if (!data.Body) {
				return NextResponse.json(
					{ error: 'Object Body is empty' },
					{ status: 404 }
				);
			}

			const bodyBuffer = await streamToBuffer(data.Body as Readable);

			return new NextResponse(bodyBuffer, {
				status: 200,
				headers: {
					'Content-Type':
						data.ContentType || 'application/octet-stream',
				},
			});
		} catch (error: any) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}
	} else {
		// Listar objetos del bucket
		try {
			const command = new ListObjectsV2Command({
				Bucket: process.env.AWS_S3_BUCKET_NAME,
			});
			const data: ListObjectsV2CommandOutput = await s3Client.send(
				command
			);
			return NextResponse.json(data, { status: 200 });
		} catch (error: any) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}
	}
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { fileName, fileContent, contentType } = body;

		if (!fileName || !fileContent) {
			return NextResponse.json(
				{ error: 'Fields fileName and fileContent are required.' },
				{ status: 400 }
			);
		}

		// Convertir el contenido en base64 a Buffer
		const fileBuffer = Buffer.from(fileContent, 'base64');

		// En v3, usamos PutObjectCommand para subir
		const command = new PutObjectCommand({
			Bucket: process.env.AWS_S3_BUCKET_NAME,
			Key: fileName,
			Body: fileBuffer,
			ContentType: contentType || 'application/octet-stream',
		});

		await s3Client.send(command);

		return NextResponse.json(
			{ message: 'File uploaded successfully' },
			{ status: 200 }
		);
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
