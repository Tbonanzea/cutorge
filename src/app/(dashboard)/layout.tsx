// app/(dashboard)/layout.tsx
import React from 'react';
import Link from 'next/link';

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div style={{ display: 'flex', minHeight: '100vh' }}>
			{/* Sidebar / Menu */}
			<aside style={{ width: '200px', backgroundColor: '#f2f2f2' }}>
				<nav>
					<ul>
						{/* <li>
							<Link href='/users'>Usuarios</Link>
						</li>
						<li>
							<Link href='/materials'>Materiales</Link>
						</li> */}
						<li>
							<Link href='/profile'>Perfil</Link>
						</li>
					</ul>
				</nav>
			</aside>
			{/* Contenido principal */}
			<main style={{ flex: 1, padding: '1rem' }}>{children}</main>
		</div>
	);
}
