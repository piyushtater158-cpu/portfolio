/**
 * Site-wide config. Contact links used by the footer CTA and case-page CTA.
 * linkedin: leave '' until the real profile URL is added — the UI hides it when empty.
 */
export const site = {
	title: 'PIYUSH TATER',
	description:
		'GenAI systems developer — AI systems, workflows, and automation for organizations.',
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
