import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Projects collection — the product of this site (doc 01).
 * One folder per project: src/content/projects/<slug>/index.mdx.
 * `_template/` is excluded so it never renders; copy its file to start a project.
 * A malformed entry must fail the build loudly with a readable error —
 * that failure IS the edit-time validation for the GitHub-as-panel workflow (doc 02).
 */
const projects = defineCollection({
	loader: glob({
		pattern: ['*/index.mdx', '!_template/**'],
		base: './src/content/projects',
		generateId: ({ entry }) => entry.replace(/\/index\.mdx$/, ''),
	}),
	schema: ({ image }) =>
		z.object({
			title: z.string().min(1, 'title is required — one line, plain text'),
			status: z.enum(['live', 'dead', 'paused'], {
				message: 'status must be exactly one of: live, dead, paused',
			}),
			date: z.coerce.date({
				message: 'date must be a real date like 2026-03-10',
			}),
			tags: z
				.array(z.string())
				.min(1, 'tags needs at least one entry, e.g. [automation]'),
			stack: z
				.array(z.string())
				.min(1, 'stack needs at least one entry, e.g. [python]'),
			outcome: z
				.string()
				.min(1, 'outcome is required — one sentence; for dead projects, what killed it'),
			org_context: z.string().optional(),
			links: z
				.object({
					youtube: z.string().url('links.youtube must be a full URL').optional(),
					linkedin: z.string().url('links.linkedin must be a full URL').optional(),
					live: z.string().url('links.live must be a full URL').optional(),
					repo: z.string().url('links.repo must be a full URL').optional(),
					x: z.string().url('links.x must be a full URL').optional(),
					other: z
						.array(
							z.object({
								label: z.string().min(1, 'links.other entries need a label, e.g. Product Hunt'),
								url: z.string().url('links.other entries need a full URL'),
							})
						)
						.optional(),
				})
				.optional(),
			hero_asset: image().optional(),
			cover_logo: image().optional(),
		}),
});

export const collections = { projects };
