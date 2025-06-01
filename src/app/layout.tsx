import Footer from '@/components/Footer';
import Header from '@/components/Header';
import '@/styles/globals.css';
import { ReactNode } from 'react';
import { Providers } from './providers';

// (Opcional) Define metadata para el <head>
export const metadata = {
	title: 'Mi App',
	description: 'Esta es mi aplicación con un layout global',
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang='es'>
			<body className='min-h-screen flex flex-col'>
				<Providers>
					<Header />
					<main className='flex-1 pt-16'>{children}</main>
					<Footer />
				</Providers>
			</body>
		</html>
	);
}
