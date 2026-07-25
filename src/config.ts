/**
 * Site-wide config. Contact links used by the footer CTA and case-page CTA.
 * linkedin: leave '' until the real profile URL is added — the UI hides it when empty.
 */
export const site = {
	// Canonical origin (must match astro.config.mjs `site`).
	url: 'https://piyushtater.com',
	// Stylised wordmark used for the hero H1 / crumb.
	title: 'PIYUSH TATER',
	// Proper-case legal name — used for the Person schema, prose, and as the
	// entity name search engines should associate with this domain.
	name: 'Piyush Tater',
	jobTitle: 'GenAI Systems Developer',
	// Default HTML <title> — leads with the name so the site can rank for it.
	seoTitle: 'Piyush Tater — GenAI Systems Developer',
	description:
		'Piyush Tater is a GenAI systems developer building AI systems, workflows, and automation for organizations.',
	// Default social share image (1200×630). Lives in /public.
	ogImage: '/og-cover.png',
	// Profiles that belong to the same person — teaches search engines the
	// entity graph so the site is recognised as the canonical "Piyush Tater".
	sameAs: [
		'https://www.linkedin.com/in/applied-genai',
		'https://github.com/piyushtater158-cpu',
	],
	contact: {
		email: 'piyushtater158@gmail.com',
		linkedin: 'https://www.linkedin.com/in/applied-genai',
	},
	chat: {
		// same-origin Vercel function (api/chat.ts) that relays to the n8n
		// Chat Trigger server-side — the webhook's CORS allowlist doesn't
		// include this site's origins, so the browser never calls it directly.
		// Not served by `astro dev`; verify chat on a preview deploy.
		webhook: '/api/chat',
	},
} as const;
