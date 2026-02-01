// app/(dashboard)/layout.tsx
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import React from 'react';
import {
	LayoutDashboard,
	Users,
	ShoppingCart,
	Package,
	Wrench,
	User,
	ClipboardList,
} from 'lucide-react';

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// Verify user is authenticated
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	if (!user) {
		redirect('/auth/login');
	}

	const dbUser = await prisma.user.findUnique({
		where: { id: user.id },
		select: { role: true },
	});

	if (!dbUser) {
		redirect('/auth/login');
	}

	const isAdmin = dbUser.role === 'ADMIN';

	return (
		<div className="flex min-h-screen">
			<nav className="w-64 p-2 flex flex-col gap-2 border-r bg-gray-50/50">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-lg">
							{isAdmin ? 'Admin Panel' : 'Mi Cuenta'}
						</CardTitle>
					</CardHeader>
					<Separator />
					<ul className="px-2 py-2 flex flex-col gap-1">
						{isAdmin ? (
							<>
								<li>
									<Button
										asChild
										variant="ghost"
										className="w-full justify-start gap-2"
									>
										<Link href="/dashboard">
											<LayoutDashboard className="h-4 w-4" />
											Dashboard
										</Link>
									</Button>
								</li>
								<li>
									<Button
										asChild
										variant="ghost"
										className="w-full justify-start gap-2"
									>
										<Link href="/orders">
											<ShoppingCart className="h-4 w-4" />
											Todas las Órdenes
										</Link>
									</Button>
								</li>
								<li>
									<Button
										asChild
										variant="ghost"
										className="w-full justify-start gap-2"
									>
										<Link href="/users">
											<Users className="h-4 w-4" />
											Usuarios
										</Link>
									</Button>
								</li>
								<li>
									<Button
										asChild
										variant="ghost"
										className="w-full justify-start gap-2"
									>
										<Link href="/materials">
											<Package className="h-4 w-4" />
											Materiales
										</Link>
									</Button>
								</li>
								<li>
									<Button
										asChild
										variant="ghost"
										className="w-full justify-start gap-2"
									>
										<Link href="/extras">
											<Wrench className="h-4 w-4" />
											Extras
										</Link>
									</Button>
								</li>
							</>
						) : (
							<li>
								<Button
									asChild
									variant="ghost"
									className="w-full justify-start gap-2"
								>
									<Link href="/my-orders">
										<ClipboardList className="h-4 w-4" />
										Mis Órdenes
									</Link>
								</Button>
							</li>
						)}
					</ul>
					<Separator />
					<ul className="px-2 py-2 flex flex-col gap-1">
						<li>
							<Button
								asChild
								variant="ghost"
								className="w-full justify-start gap-2"
							>
								<Link href="/profile">
									<User className="h-4 w-4" />
									Mi Perfil
								</Link>
							</Button>
						</li>
					</ul>
				</Card>
			</nav>
			<main className="flex-1 p-8 overflow-auto">{children}</main>
		</div>
	);
}
