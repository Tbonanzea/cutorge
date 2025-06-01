import SignUpForm from '@/components/forms/SignUpForm';
import { Card, CardContent, CardTitle } from '@/components/ui/card';

export default function SignUpPage() {
	return (
		<div className='flex justify-center pt-25'>
			<Card className='w-full max-w-md max-h-[90vh] overflow-y-auto'>
				<CardTitle className='text-center text-2xl font-bold'>
					Crear Cuenta
				</CardTitle>
				<CardContent>
					<SignUpForm />
				</CardContent>
			</Card>
		</div>
	);
}
