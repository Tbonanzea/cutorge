'use client';

import { redirect, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

function ErrorContent() {
	const searchParams = useSearchParams();
	const error = searchParams.get('error');
	const errorCode = searchParams.get('error_code');
	const errorDescription = searchParams.get('error_description');

	if (!error) {
		redirect('/');
	}

	return (
		<div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12">
			<Card className="w-full max-w-md border-destructive/50 shadow-lg">
				<CardHeader className="text-center pb-4">
					<div className="mx-auto mb-4 size-14 rounded-full bg-destructive/10 flex items-center justify-center">
						<AlertCircle className="size-7 text-destructive" />
					</div>
					<CardTitle className="text-2xl">Error Inesperado</CardTitle>
					<CardDescription className="text-base">
						Lo sentimos, algo salió mal
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<Alert variant="destructive">
						<AlertCircle className="size-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>

					{errorCode && (
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<span>Código:</span>
							<code className="bg-muted px-2 py-0.5 rounded text-foreground font-mono">
								{errorCode}
							</code>
						</div>
					)}

					{errorDescription && (
						<p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
							{errorDescription}
						</p>
					)}

					<div className="flex flex-col gap-3 pt-4">
						<Button asChild size="lg" className="w-full">
							<Link href="/">
								<Home className="size-4 mr-2" />
								Volver al inicio
							</Link>
						</Button>
						<Button variant="outline" asChild size="lg" className="w-full">
							<Link href="/quoting">
								<ArrowLeft className="size-4 mr-2" />
								Ir al cotizador
							</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

function LoadingState() {
	return (
		<div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
			<Card className="w-full max-w-md animate-pulse">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 size-14 rounded-full bg-muted" />
					<div className="h-7 bg-muted rounded w-48 mx-auto" />
					<div className="h-5 bg-muted rounded w-36 mx-auto mt-2" />
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="h-16 bg-muted rounded" />
					<div className="h-12 bg-muted rounded" />
					<div className="h-12 bg-muted rounded" />
				</CardContent>
			</Card>
		</div>
	);
}

export default function ErrorPage() {
	return (
		<Suspense fallback={<LoadingState />}>
			<ErrorContent />
		</Suspense>
	);
}
