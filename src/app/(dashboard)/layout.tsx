// app/(dashboard)/layout.tsx
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import React from 'react';

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className='flex'>
			<nav className='w-60 p-2 flex flex-col gap-2'>
				<Card>
					<CardHeader>
						<CardTitle>Menu</CardTitle>
					</CardHeader>
					<Separator />
					<ul className='px-2 flex flex-col'>
						<li>
							<Button
								asChild
								variant='ghost'
								className='w-full justify-start'
							>
								<Link href='/profile'>Perfil</Link>
							</Button>
						</li>
						<li>
							<Button
								asChild
								variant='ghost'
								className='w-full justify-start'
							>
								<Link href='/users'>Usuarios</Link>
							</Button>
						</li>
						{/* <li>
							<Button
								asChild
								variant='ghost'
								className='w-full justify-start'
							>
								<Link href='/materials'>Materiales</Link>
							</Button>
						</li> */}
					</ul>
				</Card>
			</nav>
			<main className='flex-1 p-8 overflow-auto'>{children}</main>
		</div>
	);
}
