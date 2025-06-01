import LogInForm from '@/components/forms/LogInForm';
import { Card, CardContent, CardTitle } from '@/components/ui/card';

export default function LogInPage() {
	return (
		<div className='flex justify-center pt-25'>
			<Card className='w-full max-w-md max-h-[90vh] overflow-y-auto'>
				<CardTitle className='text-center text-2xl font-bold'>
					Iniciar Sesión
				</CardTitle>
				<CardContent>
					<LogInForm />
				</CardContent>
			</Card>
		</div>
	);
}
