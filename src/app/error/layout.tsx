import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Error',
	description: 'Ha ocurrido un error',
	robots: {
		index: false,
		follow: false,
	},
};

export default function ErrorLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
