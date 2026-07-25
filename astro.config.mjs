// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	// Canonical origin — required for sitemap URLs, canonical links, and
	// absolute Open Graph URLs. Without this Astro emits no sitemap/robots.
	site: 'https://piyushtater.com',
	integrations: [mdx(), sitemap()],
});
