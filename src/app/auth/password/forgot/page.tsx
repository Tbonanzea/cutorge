import ForgotPasswordForm from '@/components/forms/ForgotPasswordForm';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function ForgotPasswordPage() {
	return (
		<div className='min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-muted/50 to-background'>
			<div className='w-full max-w-md space-y-6'>
				{/* Card */}
				<Card className='border-2 shadow-xl'>
					<CardHeader className='text-center pb-2'>
						{/* Logo */}
						<div className='text-center'>
							<Link href='/' className='inline-block'>
								<Image
									src='/images/logo.png'
									alt='CutForge'
									width={180}
									height={45}
									className='h-24 w-auto mx-auto'
								/>
							</Link>
						</div>
						<CardTitle className='text-2xl'>
							Recuperar Contraseña
						</CardTitle>
						<CardDescription>
							Ingresá tu email y te enviaremos un enlace para
							restablecer tu contraseña
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ForgotPasswordForm />
					</CardContent>
				</Card>

				{/* Back to login */}
				<div className='text-center'>
					<Link
						href='/auth/login'
						className='inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors'
					>
						<ArrowLeft className='size-4' />
						Volver a iniciar sesión
					</Link>
				</div>
			</div>
		</div>
	);
}
