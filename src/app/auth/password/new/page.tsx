import NewPasswordForm from '@/components/forms/NewPasswordForm';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { redirect } from 'next/navigation';

interface NewPasswordPageProps {
	searchParams: { [key: string]: string | string[] | undefined };
}

export default async function NewPasswordPage({
	searchParams,
}: NewPasswordPageProps) {
	const { emailRedirectTo } = await searchParams;

	if (!emailRedirectTo) {
		const error = new Error('No se ha especificado una URL para redirigir');
		redirect(`/error?error=${error.message}`);
	}

	return (
		<div className='flex justify-center pt-25'>
			<Card className='w-full max-w-md max-h-[90vh] overflow-y-auto'>
				<CardTitle className='text-center text-2xl font-bold'>
					Establecer Nueva Contraseña
				</CardTitle>
				<CardContent>
					<NewPasswordForm
						emailRedirectTo={emailRedirectTo as string}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
