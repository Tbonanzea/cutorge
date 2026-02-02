'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Home, FileText, MessageCircle, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

function PendingContent() {
	const searchParams = useSearchParams();
	const router = useRouter();

	const orderId = searchParams.get('orderId');

	// WhatsApp contact link
	const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5491234567890';
	const whatsappMessage = encodeURIComponent(
		`Hola! Tengo una consulta sobre mi orden #${orderId?.slice(0, 8).toUpperCase()} que esta pendiente de pago.`
	);
	const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

	return (
		<div className="max-w-2xl mx-auto space-y-6">
			{/* Pending Header */}
			<Card className="border-yellow-200 bg-yellow-50">
				<CardContent className="pt-6">
					<div className="flex items-center gap-4">
						<div className="flex-shrink-0">
							<Clock className="h-16 w-16 text-yellow-600" />
						</div>
						<div className="flex-1">
							<h1 className="text-2xl font-bold text-yellow-900">
								Pago Pendiente
							</h1>
							<p className="text-yellow-700 mt-1">
								Tu pago esta siendo procesado
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Order Details */}
			<Card>
				<CardHeader>
					<CardTitle>Informacion de la Orden</CardTitle>
					<CardDescription>
						Tu pago esta en revision
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
						<h3 className="font-semibold text-slate-900">Que esta pasando?</h3>
						<ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
							<li>
								Tu pago esta siendo verificado por MercadoPago o el banco
							</li>
							<li>
								Este proceso puede demorar hasta 24-48 horas
							</li>
							<li>
								Te enviaremos un email cuando el pago sea confirmado
							</li>
							<li>
								Si pagaste en efectivo, puede demorar hasta 2 horas habiles
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

			{/* Additional Info */}
			<Card className="border-blue-200 bg-blue-50">
				<CardContent className="pt-6">
					<h3 className="font-semibold text-blue-900 mb-2">
						Revisa tu email
					</h3>
					<p className="text-sm text-blue-700">
						Te notificaremos por email cuando tu pago sea confirmado. Revisa tambien
						tu carpeta de spam por si el email llegara ahi.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}

export default function CheckoutPendingPage() {
	return (
		<div className="container py-8">
			<Suspense fallback={
				<div className="flex items-center justify-center min-h-[400px]">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			}>
				<PendingContent />
			</Suspense>
		</div>
	);
}
