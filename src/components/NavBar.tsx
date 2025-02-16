import { signOut } from '@/app/auth/signup/actions';
import Link from 'next/link';

export default function NavBar() {
	return (
		<header className='w-full bg-blue-500 p-4 text-white'>
			<nav className='flex'>
				<h1 className='text-2xl font-bold object-left'>CutForge</h1>
				<div className='flex-grow'></div>
				<div className='flex gap-4'>
					<Link href='/'>Inicio</Link>
					{' | '}
					<Link href='/quoting'>Cotizador</Link>
					{' | '}
					<Link href='/about'>Acerca de</Link>
					{' | '}
					<button
						className='bg-blue-700 text-white p-2 rounded'
						onClick={signOut}
					>
						Cerrar sesión
					</button>
				</div>
			</nav>
		</header>
	);
}
