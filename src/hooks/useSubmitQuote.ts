'use client';

import { useMutation } from '@tanstack/react-query';
import { useQuoting } from '@/context/quotingContext';
import { useRouter } from 'next/navigation';
import { calculateExtrasTotal } from '@/lib/constants';

interface SubmitQuoteResponse {
	orderId: string;
	totalPrice: number;
	message: string;
}

/**
 * Helper function to upload a file to S3
 */
async function uploadFileToS3(file: File, fileName: string): Promise<string> {
	// Read file as base64
	const reader = new FileReader();
	const fileContentPromise = new Promise<string>((resolve, reject) => {
		reader.onload = () => {
			const result = reader.result as string;
			// Extract base64 content (remove data:mime;base64, prefix)
			const base64Content = result.split(',')[1];
			resolve(base64Content);
		};
		reader.onerror = reject;
	});
	reader.readAsDataURL(file);

	const fileContent = await fileContentPromise;

	// Upload to S3 via API route
	const response = await fetch('/api/file', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			fileName,
			fileContent,
			contentType: file.type || 'application/dxf',
		}),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Failed to upload file');
	}

	// Return the S3 key (fileName)
	return fileName;
}

/**
 * TanStack Query mutation hook for submitting quote
 * Handles file upload to S3 and order creation
 */
export function useSubmitQuote() {
	const { cart, reset } = useQuoting();
	const router = useRouter();

	return useMutation<SubmitQuoteResponse, Error, void>({
		mutationFn: async () => {
			// Validation
			if (cart.items.length === 0) {
				throw new Error('No items in cart');
			}

			const invalidItems = cart.items.filter(
				(item) =>
					!item.file ||
					!item.material ||
					!item.materialType ||
					item.quantity <= 0
			);

			if (invalidItems.length > 0) {
				throw new Error('Some cart items are incomplete');
			}

			// Step 1: Upload all files to S3 (only if they have _rawFile)
			const uploadPromises = cart.items.map(async (item, idx) => {
				if (item.file._rawFile) {
					// Generate unique S3 key
					const timestamp = Date.now();
					const sanitizedFilename = item.file.filename.replace(
						/[^a-zA-Z0-9.-]/g,
						'_'
					);
					const s3Key = `uploads/${timestamp}-${idx}-${sanitizedFilename}`;

					// Upload to S3
					await uploadFileToS3(item.file._rawFile, s3Key);

					return {
						...item,
						file: {
							...item.file,
							filepath: s3Key, // Update filepath with S3 key
						},
					};
				}
				return item;
			});

			const uploadedItems = await Promise.all(uploadPromises);

			// Step 2: Create order via API
			const totalPrice = uploadedItems.reduce((sum, item) => {
				return (
					sum + (item.materialType?.pricePerUnit || 0) * item.quantity
				);
			}, 0);

			// Add extras to total
			const extrasTotal = calculateExtrasTotal(cart.extras || []);

			// Calculate grand total (used for order total)
			const _grandTotal = totalPrice + extrasTotal;

			// Prepare order items for API
			const orderItems = uploadedItems.map((item) => ({
				fileData: {
					filename: item.file.filename,
					filepath: item.file.filepath,
					filetype: item.file.filetype,
				},
				materialTypeId: item.materialType!.id,
				quantity: item.quantity,
				price: item.materialType!.pricePerUnit,
			}));

			// Call orders API
			const response = await fetch('/api/orders', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					items: orderItems,
					extras: cart.extras,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to create order');
			}

			const data = await response.json();

			return {
				orderId: data.orderId,
				totalPrice: data.totalPrice,
				message: data.message || 'Cotización enviada exitosamente',
			};
		},
		onSuccess: (data) => {
			// Reset cart on success
			reset();

			// Redirect to success page with order ID
			router.push(`/quoting/success?orderId=${data.orderId}`);
		},
		onError: (error) => {
			console.error('Error submitting quote:', error);
			// Error handling is done by the component using this hook
		},
	});
}
