// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * lastmod map for /projects/<slug> from frontmatter `date:` — baked at config
 * load so @astrojs/sitemap serialize does not need the content collection API.
 */
function projectLastmods() {
	/** @type {Map<string, Date>} */
	const map = new Map();
	const base = './src/content/projects';
	for (const dir of readdirSync(base, { withFileTypes: true })) {
		if (!dir.isDirectory()) continue;
		if (dir.name.startsWith('_') || dir.name.startsWith('tmp-')) continue;
		try {
			const mdx = readFileSync(join(base, dir.name, 'index.mdx'), 'utf8');
			const match = mdx.match(/^date:\s*['"]?(\d{4}-\d{2}-\d{2})/m);
			if (match) {
				map.set(`/projects/${dir.name}`, new Date(match[1]));
				map.set(`/projects/${dir.name}/`, new Date(match[1]));
			}
		} catch {
			// Skip folders without index.mdx
		}
	}
	return map;
}

const lastmods = projectLastmods();
const buildTime = new Date();

// https://astro.build/config
export default defineConfig({
	// Canonical origin — required for sitemap URLs, canonical links, and
	// absolute Open Graph URLs. Without this Astro emits no sitemap/robots.
	site: 'https://piyushtater.com',
	integrations: [
		mdx(),
		sitemap({
			filter: (page) => !/\/projects\/tmp-/.test(page),
			serialize(item) {
				try {
					const path = new URL(item.url).pathname.replace(/\/$/, '') || '/';
					if (path === '/') {
						item.lastmod = buildTime;
					} else {
						const projectDate = lastmods.get(path) ?? lastmods.get(`${path}/`);
						if (projectDate) item.lastmod = projectDate;
					}
				} catch {
					// Keep default lastmod if URL parse fails
				}
				return item;
			},
		}),
	],
});
