'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
	CreditCard,
	Building2,
	Loader2,
	ArrowLeft,
	Copy,
	Check,
	AlertCircle,
	ShieldCheck
} from 'lucide-react';

interface OrderData {
	id: string;
	totalPrice: number;
	status: string;
	items: {
		id: string;
		quantity: number;
		price: number;
		file: { filename: string };
		materialType: {
			width: number;
			length: number;
			height: number;
			material: { name: string };
		};
	}[];
	extras: {
		id: string;
		quantity: number;
		priceAtOrder: number;
		extraService: { name: string };
	}[];
}

type PaymentMethod = 'mercadopago' | 'transfer' | null;

function CheckoutContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const orderId = searchParams.get('orderId');

	const [orderData, setOrderData] = useState<OrderData | null>(null);
	const [loading, setLoading] = useState(true);
	const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
	const [processingPayment, setProcessingPayment] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [copiedField, setCopiedField] = useState<string | null>(null);

	// Bank info (from env)
	const bankInfo = {
		holder: process.env.NEXT_PUBLIC_BANK_HOLDER || 'Por configurar',
		cbu: process.env.NEXT_PUBLIC_BANK_CBU || 'Por configurar',
		alias: process.env.NEXT_PUBLIC_BANK_ALIAS || 'Por configurar',
		bank: process.env.NEXT_PUBLIC_BANK_NAME || 'Por configurar',
	};

	useEffect(() => {
		if (!orderId) {
			router.push('/quoting');
			return;
		}

		async function fetchOrder() {
			try {
				const response = await fetch(`/api/orders?orderId=${orderId}`);
				if (response.ok) {
					const data = await response.json();
					// Find the specific order
					const order = data.orders?.find((o: OrderData) => o.id === orderId);
					if (order) {
						// Check if order is still pending
						if (order.status !== 'PENDING') {
							router.push(`/checkout/success?orderId=${orderId}`);
							return;
						}
						setOrderData(order);
					} else {
						setError('Orden no encontrada');
					}
				} else {
					setError('Error al cargar la orden');
				}
			} catch (err) {
				console.error('Error fetching order:', err);
				setError('Error al cargar la orden');
			} finally {
				setLoading(false);
			}
		}

		fetchOrder();
	}, [orderId, router]);

	const handleMercadoPagoPayment = async () => {
		if (!orderId) return;

		setProcessingPayment(true);
		setError(null);

		try {
			const response = await fetch('/api/payments/create-preference', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ orderId }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Error al crear preferencia de pago');
			}

			// Redirect to MercadoPago
			// Use sandbox_init_point for testing, init_point for production
			const redirectUrl = data.sandbox_init_point || data.init_point;

			if (redirectUrl) {
				window.location.href = redirectUrl;
			} else {
				throw new Error('No se recibió URL de pago');
			}
		} catch (err: any) {
			console.error('Error creating payment:', err);
			setError(err.message || 'Error al procesar el pago');
			setProcessingPayment(false);
		}
	};

	const handleTransferPayment = async () => {
		if (!orderId) return;

		setProcessingPayment(true);
		setError(null);

		try {
			const response = await fetch('/api/payments/create-transfer', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ orderId }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Error al crear pago por transferencia');
			}

			// Show transfer instructions
			setSelectedMethod('transfer');
		} catch (err: any) {
			console.error('Error creating transfer:', err);
			setError(err.message || 'Error al procesar');
		} finally {
			setProcessingPayment(false);
		}
	};

	const copyToClipboard = async (text: string, field: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopiedField(field);
			setTimeout(() => setCopiedField(null), 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (error && !orderData) {
		return (
			<div className="max-w-2xl mx-auto">
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
				<Button
					variant="outline"
					className="mt-4"
					onClick={() => router.push('/quoting')}
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Volver
				</Button>
			</div>
		);
	}

	if (!orderData || !orderId) {
		return null;
	}

	// Calculate totals
	const itemsTotal = orderData.items.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0
	);
	const extrasTotal = orderData.extras.reduce(
		(sum, extra) => sum + extra.priceAtOrder * extra.quantity,
		0
	);

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => router.back()}
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div>
					<h1 className="text-2xl font-bold">Checkout</h1>
					<p className="text-muted-foreground">
						Orden #{orderId.slice(0, 8).toUpperCase()}
					</p>
				</div>
			</div>

			{error && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			<div className="grid md:grid-cols-3 gap-6">
				{/* Payment Methods */}
				<div className="md:col-span-2 space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Selecciona tu metodo de pago</CardTitle>
							<CardDescription>
								Elige como deseas pagar tu orden
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* MercadoPago Option */}
							<button
								onClick={() => setSelectedMethod('mercadopago')}
								className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
									selectedMethod === 'mercadopago'
										? 'border-blue-500 bg-blue-50'
										: 'border-gray-200 hover:border-gray-300'
								}`}
							>
								<div className="flex items-center gap-4">
									<div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
										<CreditCard className="h-6 w-6 text-blue-600" />
									</div>
									<div className="flex-1">
										<h3 className="font-semibold">MercadoPago</h3>
										<p className="text-sm text-muted-foreground">
											Tarjeta de credito, debito, efectivo y mas
										</p>
									</div>
									<div className="flex items-center gap-1 text-xs text-success">
										<ShieldCheck className="h-4 w-4" />
										Seguro
									</div>
								</div>
							</button>

							{/* Bank Transfer Option */}
							<button
								onClick={() => setSelectedMethod('transfer')}
								className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
									selectedMethod === 'transfer'
										? 'border-blue-500 bg-blue-50'
										: 'border-gray-200 hover:border-gray-300'
								}`}
							>
								<div className="flex items-center gap-4">
									<div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
										<Building2 className="h-6 w-6 text-emerald-600" />
									</div>
									<div className="flex-1">
										<h3 className="font-semibold">Transferencia Bancaria</h3>
										<p className="text-sm text-muted-foreground">
											Transferencia directa a nuestra cuenta
										</p>
									</div>
								</div>
							</button>

							<Separator />

							{/* Payment Action */}
							{selectedMethod === 'mercadopago' && (
								<div className="space-y-4">
									<p className="text-sm text-muted-foreground">
										Seras redirigido a MercadoPago para completar tu pago de forma segura.
									</p>
									<Button
										className="w-full bg-blue-600 hover:bg-blue-700"
										size="lg"
										onClick={handleMercadoPagoPayment}
										disabled={processingPayment}
									>
										{processingPayment ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Procesando...
											</>
										) : (
											<>
												<CreditCard className="mr-2 h-4 w-4" />
												Pagar con MercadoPago
											</>
										)}
									</Button>
								</div>
							)}

							{selectedMethod === 'transfer' && (
								<div className="space-y-4">
									<Alert>
										<AlertDescription>
											Realiza la transferencia a la siguiente cuenta y te confirmaremos el pago en 24-48 horas habiles.
										</AlertDescription>
									</Alert>

									<div className="bg-muted rounded-lg p-4 space-y-3">
										<div className="flex justify-between items-center">
											<span className="text-sm text-muted-foreground">Titular</span>
											<div className="flex items-center gap-2">
												<span className="font-medium">{bankInfo.holder}</span>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => copyToClipboard(bankInfo.holder, 'holder')}
												>
													{copiedField === 'holder' ? (
														<Check className="h-4 w-4 text-success" />
													) : (
														<Copy className="h-4 w-4" />
													)}
												</Button>
											</div>
										</div>
										<div className="flex justify-between items-center">
											<span className="text-sm text-muted-foreground">Banco</span>
											<span className="font-medium">{bankInfo.bank}</span>
										</div>
										<div className="flex justify-between items-center">
											<span className="text-sm text-muted-foreground">CBU</span>
											<div className="flex items-center gap-2">
												<span className="font-mono font-medium">{bankInfo.cbu}</span>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => copyToClipboard(bankInfo.cbu, 'cbu')}
												>
													{copiedField === 'cbu' ? (
														<Check className="h-4 w-4 text-success" />
													) : (
														<Copy className="h-4 w-4" />
													)}
												</Button>
											</div>
										</div>
										<div className="flex justify-between items-center">
											<span className="text-sm text-muted-foreground">Alias</span>
											<div className="flex items-center gap-2">
												<span className="font-medium">{bankInfo.alias}</span>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => copyToClipboard(bankInfo.alias, 'alias')}
												>
													{copiedField === 'alias' ? (
														<Check className="h-4 w-4 text-success" />
													) : (
														<Copy className="h-4 w-4" />
													)}
												</Button>
											</div>
										</div>
										<Separator />
										<div className="flex justify-between items-center">
											<span className="text-sm text-muted-foreground">Monto a transferir</span>
											<div className="flex items-center gap-2">
												<span className="font-bold text-lg text-success">
													${orderData.totalPrice.toFixed(2)}
												</span>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => copyToClipboard(orderData.totalPrice.toFixed(2), 'amount')}
												>
													{copiedField === 'amount' ? (
														<Check className="h-4 w-4 text-success" />
													) : (
														<Copy className="h-4 w-4" />
													)}
												</Button>
											</div>
										</div>
									</div>

									<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
										<p className="text-sm text-yellow-800">
											<strong>Importante:</strong> Incluye el numero de orden
											<span className="font-mono font-bold"> #{orderId.slice(0, 8).toUpperCase()}</span> en la descripcion de la transferencia para identificar tu pago.
										</p>
									</div>

									<Button
										className="w-full"
										variant="outline"
										size="lg"
										onClick={handleTransferPayment}
										disabled={processingPayment}
									>
										{processingPayment ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Procesando...
											</>
										) : (
											'Ya realice la transferencia'
										)}
									</Button>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Order Summary */}
				<div className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Resumen de tu orden</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Items */}
							<div className="space-y-2">
								{orderData.items.map((item) => (
									<div key={item.id} className="flex justify-between text-sm">
										<div className="flex-1">
											<p className="font-medium truncate">
												{item.file.filename}
											</p>
											<p className="text-muted-foreground text-xs">
												{item.materialType.material.name} x{item.quantity}
											</p>
										</div>
										<span>${(item.price * item.quantity).toFixed(2)}</span>
									</div>
								))}
							</div>

							{/* Extras */}
							{orderData.extras.length > 0 && (
								<>
									<Separator />
									<div className="space-y-2">
										<p className="text-sm font-medium text-muted-foreground">Extras</p>
										{orderData.extras.map((extra) => (
											<div key={extra.id} className="flex justify-between text-sm">
												<span>{extra.extraService.name}</span>
												<span>${extra.priceAtOrder.toFixed(2)}</span>
											</div>
										))}
									</div>
								</>
							)}

							<Separator />

							{/* Totals */}
							<div className="space-y-2">
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Subtotal Items</span>
									<span>${itemsTotal.toFixed(2)}</span>
								</div>
								{extrasTotal > 0 && (
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">Subtotal Extras</span>
										<span>${extrasTotal.toFixed(2)}</span>
									</div>
								)}
								<Separator />
								<div className="flex justify-between font-bold text-lg">
									<span>Total</span>
									<span className="text-success">
										${orderData.totalPrice.toFixed(2)}
									</span>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Security Badge */}
					<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
						<ShieldCheck className="h-4 w-4" />
						<span>Pago 100% seguro</span>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function CheckoutPage() {
	return (
		<div className="container py-8">
			<Suspense fallback={
				<div className="flex items-center justify-center min-h-[400px]">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			}>
				<CheckoutContent />
			</Suspense>
		</div>
	);
}
