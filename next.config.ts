import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	/* config options here */
	webpack: (config) => {
		// Ensure only one instance of Three.js is loaded
		config.resolve.alias = {
			...config.resolve.alias,
			three: require.resolve('three'),
		};
		return config;
	},
};

export default nextConfig;
