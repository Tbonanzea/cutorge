import ForgotPasswordForm from '@/components/forms/ForgotPasswordForm';
import { Card, CardContent, CardTitle } from '@/components/ui/card';

export default function ForgotPasswordPage() {
	return (
		<div className='flex justify-center pt-25'>
			<Card className='w-full max-w-md max-h-[90vh] overflow-y-auto'>
				<CardTitle className='text-center text-2xl font-bold'>
					Recuperar Contraseña
				</CardTitle>
				<CardContent>
					<ForgotPasswordForm />
				</CardContent>
			</Card>
		</div>
	);
}
