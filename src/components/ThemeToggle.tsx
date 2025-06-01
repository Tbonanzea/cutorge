'use client';

import { useEffect, useState } from 'react';
import { Toggle } from './ui/toggle';

export function ThemeToggle() {
	const [dark, setDark] = useState(false);

	useEffect(() => {
		// Si el user ya tenía preferencia guardada
		if (window.localStorage.getItem('theme') === 'dark') {
			document.documentElement.classList.add('dark');
			setDark(true);
		}
	}, []);

	const toggleTheme = () => {
		if (document.documentElement.classList.contains('dark')) {
			document.documentElement.classList.remove('dark');
			window.localStorage.setItem('theme', 'light');
			setDark(false);
		} else {
			document.documentElement.classList.add('dark');
			window.localStorage.setItem('theme', 'dark');
			setDark(true);
		}
	};

	return <Toggle onClick={toggleTheme}>{dark ? '🌙' : '☀️'}</Toggle>;
}
