import { signOut } from '@/app/auth/actions';
import { Button } from '@/components/ui/button';
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { SquareUser } from 'lucide-react';

export default function NavBar() {
	return (
		<nav className='fixed top-0 left-0 w-full flex items-center justify-between h-16 px-4 border-b bg-background z-50'>
			{/* Brand */}
			<span className='font-bold text-xl'>CutForge</span>
			{/* Navigation Links */}
			<div className='flex items-center gap-4'>
				<NavigationMenu>
					<NavigationMenuList>
						<NavigationMenuItem>
							<NavigationMenuLink
								className='px-3 py-2 font-medium text-sm'
								href='/'
							>
								Inicio
							</NavigationMenuLink>
						</NavigationMenuItem>
						<NavigationMenuItem>
							<NavigationMenuLink
								className='px-3 py-2 font-medium text-sm'
								href='/quoting'
							>
								Cotizador
							</NavigationMenuLink>
						</NavigationMenuItem>
						<NavigationMenuItem>
							<NavigationMenuLink
								className='px-3 py-2 font-medium text-sm'
								href='/about'
							>
								Acerca de
							</NavigationMenuLink>
						</NavigationMenuItem>
						<NavigationMenuItem>
							{/* Logout */}
							<Button variant='outline' onClick={signOut}>
								<SquareUser />
								Cerrar sesión
							</Button>
						</NavigationMenuItem>
					</NavigationMenuList>
				</NavigationMenu>
			</div>
		</nav>
	);
}
