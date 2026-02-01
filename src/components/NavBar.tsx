'use client';

import { signOut } from '@/app/auth/actions';
import { Button } from '@/components/ui/button';
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet';
import { LayoutDashboard, LogOut, Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface NavBarProps {
	isAdmin?: boolean;
}

const navLinks = [
	{ href: '/', label: 'Inicio' },
	{ href: '/quoting', label: 'Cotizador' },
	{ href: '/about', label: 'Acerca de' },
];

export default function NavBar({ isAdmin = false }: NavBarProps) {
	const [open, setOpen] = useState(false);
	const pathname = usePathname();

	const isActive = (href: string) => {
		if (href === '/') return pathname === '/';
		return pathname.startsWith(href);
	};

	return (
		<nav className='fixed top-0 left-0 w-full flex items-center justify-between h-18 px-4 md:px-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50'>
			{/* Brand */}
			<Link href='/' className='shrink-0'>
				<Image
					src='/images/logo.png'
					alt='CutForge'
					width={240}
					height={64}
					priority
					className='h-24 w-auto'
				/>
			</Link>

			{/* Desktop Navigation */}
			<div className='hidden md:flex items-center gap-1'>
				{navLinks.map((link) => (
					<Link
						key={link.href}
						href={link.href}
						className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
							isActive(link.href)
								? 'bg-accent text-accent-foreground'
								: 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
						}`}
					>
						{link.label}
					</Link>
				))}
				{isAdmin && (
					<Link
						href='/dashboard'
						className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
							isActive('/dashboard')
								? 'bg-accent text-accent-foreground'
								: 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
						}`}
					>
						<LayoutDashboard className='size-4' />
						Admin
					</Link>
				)}
				<div className='ml-2 pl-2 border-l'>
					<Button
						variant='outline'
						size='sm'
						onClick={() => signOut()}
						className='gap-2'
					>
						<LogOut className='size-4' />
						Salir
					</Button>
				</div>
			</div>

			{/* Mobile Menu */}
			<Sheet open={open} onOpenChange={setOpen}>
				<SheetTrigger asChild className='md:hidden'>
					<Button variant='ghost' size='icon' aria-label='Abrir menú'>
						<Menu className='size-5' />
					</Button>
				</SheetTrigger>
				<SheetContent side='right' className='w-72'>
					<SheetHeader className='text-left'>
						<SheetTitle>
							<Image
								src='/images/logo.png'
								alt='CutForge'
								width={120}
								height={30}
								className='h-7 w-auto'
							/>
						</SheetTitle>
					</SheetHeader>
					<div className='mt-8 flex flex-col gap-1'>
						{navLinks.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								onClick={() => setOpen(false)}
								className={`px-4 py-3 text-base font-medium rounded-lg transition-colors ${
									isActive(link.href)
										? 'bg-accent text-accent-foreground'
										: 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
								}`}
							>
								{link.label}
							</Link>
						))}
						{isAdmin && (
							<Link
								href='/dashboard'
								onClick={() => setOpen(false)}
								className={`px-4 py-3 text-base font-medium rounded-lg transition-colors flex items-center gap-2 ${
									isActive('/dashboard')
										? 'bg-accent text-accent-foreground'
										: 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
								}`}
							>
								<LayoutDashboard className='size-5' />
								Admin
							</Link>
						)}
						<div className='mt-4 pt-4 border-t'>
							<Button
								variant='outline'
								className='w-full justify-start gap-2'
								onClick={() => {
									setOpen(false);
									signOut();
								}}
							>
								<LogOut className='size-4' />
								Cerrar sesión
							</Button>
						</div>
					</div>
				</SheetContent>
			</Sheet>
		</nav>
	);
}
