import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Mi Perfil',
	description: 'Gestiona tu información personal y direcciones de envío',
};

export default function ProfileLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
