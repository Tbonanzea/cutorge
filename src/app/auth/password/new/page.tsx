import NewPasswordForm from '@/components/forms/NewPasswordForm';
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

	return <NewPasswordForm emailRedirectTo={emailRedirectTo as string} />;
}
