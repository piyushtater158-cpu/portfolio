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
		// n8n Chat Trigger endpoint — its "Allowed Origins (CORS)" list must
		// include every origin this site serves from (localhost, *.vercel.app).
		webhook:
			'https://n8n.piyushtater.com/webhook/bee9de3f-3761-48d4-9d51-b2ccbb25e29e/chat',
	},
} as const;
