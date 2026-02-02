'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, RefreshCw, Home, MessageCircle, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

function FailureContent() {
	const searchParams = useSearchParams();
	const router = useRouter();

	const orderId = searchParams.get('orderId');

	// WhatsApp contact link
	const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5491234567890';
	const whatsappMessage = encodeURIComponent(
		`Hola! Tuve un problema con el pago de mi orden #${orderId?.slice(0, 8).toUpperCase()}. Necesito ayuda.`
	);
	const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

	return (
		<div className="max-w-2xl mx-auto space-y-6">
			{/* Failure Header */}
			<Card className="border-red-200 bg-red-50">
				<CardContent className="pt-6">
					<div className="flex items-center gap-4">
						<div className="flex-shrink-0">
							<XCircle className="h-16 w-16 text-destructive" />
						</div>
						<div className="flex-1">
							<h1 className="text-2xl font-bold text-red-900">
								Pago No Completado
							</h1>
							<p className="text-red-700 mt-1">
								No pudimos procesar tu pago
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Order Details */}
			<Card>
				<CardHeader>
					<CardTitle>Que paso?</CardTitle>
					<CardDescription>
						Tu pago no pudo ser procesado
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{orderId && (
						<div className="p-4 bg-muted/30 rounded-lg">
							<p className="text-sm text-muted-foreground">Numero de Orden</p>
							<p className="text-xl font-mono font-bold text-slate-900">
								#{orderId.slice(0, 8).toUpperCase()}
							</p>
						</div>
					)}

					<Separator />

					<div className="space-y-2">
						<h3 className="font-semibold text-slate-900">Posibles causas:</h3>
						<ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
							<li>
								La tarjeta fue rechazada por fondos insuficientes
							</li>
							<li>
								Los datos de la tarjeta ingresados son incorrectos
							</li>
							<li>
								El pago fue cancelado antes de completarse
							</li>
							<li>
								Hubo un problema tecnico con el procesador de pagos
							</li>
						</ul>
					</div>
				</CardContent>
			</Card>

			{/* Actions */}
			<Card>
				<CardHeader>
					<CardTitle>Que puedo hacer?</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					{orderId && (
						<Button
							className="w-full"
							onClick={() => router.push(`/checkout?orderId=${orderId}`)}
						>
							<RefreshCw className="mr-2 h-5 w-5" />
							Intentar nuevamente
						</Button>
					)}
					<Button
						variant="outline"
						className="w-full bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
						onClick={() => window.open(whatsappLink, '_blank')}
					>
						<MessageCircle className="mr-2 h-5 w-5" />
						Contactar por WhatsApp
					</Button>
					<Button
						variant="outline"
						className="w-full"
						onClick={() => router.push('/')}
					>
						<Home className="mr-2 h-5 w-5" />
						Volver al Inicio
					</Button>
				</CardContent>
			</Card>

			{/* Tips */}
			<Card className="border-blue-200 bg-blue-50">
				<CardContent className="pt-6">
					<h3 className="font-semibold text-blue-900 mb-2">
						Consejos para reintentar
					</h3>
					<ul className="text-sm text-blue-700 space-y-1">
						<li>- Verifica que tu tarjeta tenga fondos suficientes</li>
						<li>- Revisa que los datos de la tarjeta esten correctos</li>
						<li>- Prueba con otro metodo de pago</li>
						<li>- Contacta a tu banco si el problema persiste</li>
					</ul>
				</CardContent>
			</Card>
		</div>
	);
}

export default function CheckoutFailurePage() {
	return (
		<div className="container py-8">
			<Suspense fallback={
				<div className="flex items-center justify-center min-h-[400px]">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			}>
				<FailureContent />
			</Suspense>
		</div>
	);
}
