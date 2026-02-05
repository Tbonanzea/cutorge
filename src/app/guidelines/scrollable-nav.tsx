'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface Section {
	id: string;
	label: string;
}

export function ScrollableNav({ sections }: { sections: Section[] }) {
	const scrollRef = useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);

	const checkScroll = useCallback(() => {
		const el = scrollRef.current;
		if (!el) return;
		setCanScrollLeft(el.scrollLeft > 1);
		setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
	}, []);

	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;

		checkScroll();

		el.addEventListener('scroll', checkScroll, { passive: true });
		window.addEventListener('resize', checkScroll);

		return () => {
			el.removeEventListener('scroll', checkScroll);
			window.removeEventListener('resize', checkScroll);
		};
	}, [checkScroll]);

	return (
		<div className='lg:hidden sticky top-18 z-40 -mx-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b'>
			<div className='relative'>
				<div
					ref={scrollRef}
					className='overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
				>
					<div className='flex gap-2 py-3 px-4'>
						{sections.map((section) => (
							<a
								key={section.id}
								href={`#${section.id}`}
								className='px-4 py-2 text-sm font-medium rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-foreground transition-colors whitespace-nowrap'
							>
								{section.label}
							</a>
						))}
					</div>
				</div>
				<div
					className={`pointer-events-none absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-background to-transparent transition-opacity duration-200 ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`}
				/>
				<div
					className={`pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-background to-transparent transition-opacity duration-200 ${canScrollRight ? 'opacity-100' : 'opacity-0'}`}
				/>
			</div>
		</div>
	);
}
