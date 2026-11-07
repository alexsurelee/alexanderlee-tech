// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';
import { checkFonts, fontDirectory } from './scripts/fonts.mjs';

const hasBerkeleyMono = checkFonts(fontDirectory, undefined, process.env.REQUIRE_LICENSED_FONTS === '1');

// https://astro.build/config
export default defineConfig({
	site: 'https://alexanderlee.tech',
	integrations: [mdx(), sitemap()],
	fonts: [
		{
			provider: fontProviders.local(),
			name: hasBerkeleyMono ? 'Berkeley Mono' : 'Atkinson',
			cssVariable: '--font-body',
			fallbacks: [hasBerkeleyMono ? 'monospace' : 'sans-serif'],
			options: {
				variants: hasBerkeleyMono ? [
					{ src: ['./src/assets/fonts/berkeley-mono/BerkeleyMono-Regular.woff2'], weight: 400, style: 'normal', display: 'swap' },
					{ src: ['./src/assets/fonts/berkeley-mono/BerkeleyMono-Oblique.woff2'], weight: 400, style: 'oblique', display: 'swap' },
					{ src: ['./src/assets/fonts/berkeley-mono/BerkeleyMono-Bold.woff2'], weight: 700, style: 'normal', display: 'swap' },
					{ src: ['./src/assets/fonts/berkeley-mono/BerkeleyMono-Bold-Oblique.woff2'], weight: 700, style: 'oblique', display: 'swap' },
				] : [
					{
						src: ['./src/assets/fonts/atkinson-regular.woff'],
						weight: 400,
						style: 'normal',
						display: 'swap',
					},
					{
						src: ['./src/assets/fonts/atkinson-bold.woff'],
						weight: 700,
						style: 'normal',
						display: 'swap',
					},
				],
			},
		},
	],
});
