'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Home, FileText, MessageCircle, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

function SuccessContent() {
	const searchParams = useSearchParams();
	const router = useRouter();

	const orderId = searchParams.get('orderId');
	const paymentId = searchParams.get('payment_id');
	const _status = searchParams.get('status');

	// WhatsApp contact link
	const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5491234567890';
	const whatsappMessage = encodeURIComponent(
		`Hola! Acabo de pagar mi orden #${orderId?.slice(0, 8).toUpperCase()}. Quedo atento/a a novedades.`
	);
	const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

	return (
		<div className="max-w-2xl mx-auto space-y-6">
			{/* Success Header */}
			<Card className="border-green-200 bg-green-50">
				<CardContent className="pt-6">
					<div className="flex items-center gap-4">
						<div className="flex-shrink-0">
							<CheckCircle2 className="h-16 w-16 text-success" />
						</div>
						<div className="flex-1">
							<h1 className="text-2xl font-bold text-green-900">
								Pago Exitoso
							</h1>
							<p className="text-green-700 mt-1">
								Tu pago ha sido procesado correctamente
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Order Details */}
			<Card>
				<CardHeader>
					<CardTitle>Detalles del Pago</CardTitle>
					<CardDescription>
						Guarda esta informacion para tu referencia
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{orderId && (
						<div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
							<div>
								<p className="text-sm text-muted-foreground">Numero de Orden</p>
								<p className="text-xl font-mono font-bold text-slate-900">
									#{orderId.slice(0, 8).toUpperCase()}
								</p>
							</div>
							{paymentId && (
								<div className="text-right">
									<p className="text-sm text-muted-foreground">ID de Pago</p>
									<p className="text-sm font-mono text-gray-700">
										{paymentId}
									</p>
								</div>
							)}
						</div>
					)}

					<Separator />

					<div className="space-y-2">
						<h3 className="font-semibold text-slate-900">Proximos Pasos:</h3>
						<ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
							<li>
								Recibiras un email de confirmacion con los detalles de tu pago
							</li>
							<li>
								Nuestro equipo comenzara a procesar tu orden
							</li>
							<li>
								Te notificaremos cuando tu pedido este listo para envio
							</li>
							<li>
								Podras seguir el estado de tu orden desde tu dashboard
							</li>
						</ol>
					</div>
				</CardContent>
			</Card>

			{/* Actions */}
			<Card>
				<CardHeader>
					<CardTitle>Que deseas hacer?</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<Button
						className="w-full"
						onClick={() => router.push('/my-orders')}
					>
						<FileText className="mr-2 h-5 w-5" />
						Ver mis ordenes
					</Button>
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

			{/* Estimated Time */}
			<Card>
				<CardContent className="pt-6">
					<h3 className="font-semibold text-slate-900 mb-3">
						Tiempos Estimados
					</h3>
					<div className="space-y-2 text-sm text-gray-700">
						<p>
							<strong>Procesamiento:</strong> 1-2 dias habiles
						</p>
						<p>
							<strong>Produccion:</strong> 3-7 dias habiles (segun complejidad)
						</p>
						<p>
							<strong>Envio:</strong> Te notificaremos con numero de seguimiento
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export default function CheckoutSuccessPage() {
	return (
		<div className="container py-8">
			<Suspense fallback={
				<div className="flex items-center justify-center min-h-[400px]">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			}>
				<SuccessContent />
			</Suspense>
		</div>
	);
}
