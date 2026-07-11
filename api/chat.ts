/**
 * Same-origin proxy for the mascot chat → n8n Chat Trigger webhook.
 * Exists because the webhook's CORS allowlist doesn't include this site's
 * origins; server-to-server has no CORS, and the browser only ever talks to
 * /api/chat. Streams the upstream NDJSON body through untouched.
 *
 * Vercel builds everything in api/ as functions alongside the static Astro
 * output; this endpoint does not exist under `astro dev` (verify chat on a
 * preview deploy, or run `vercel dev`).
 */
const WEBHOOK =
	'https://n8n.piyushtater.com/webhook/bee9de3f-3761-48d4-9d51-b2ccbb25e29e/chat';
const MAX_BODY = 8_192;

export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
	if (req.method !== 'POST')
		return new Response('method not allowed', { status: 405 });

	const raw = await req.text();
	if (raw.length > MAX_BODY)
		return new Response('payload too large', { status: 413 });

	// only forward the exact shape the widget sends — this is a relay to one
	// fixed webhook, not a general proxy
	let body: { action?: unknown; sessionId?: unknown; chatInput?: unknown };
	try {
		body = JSON.parse(raw);
	} catch {
		return new Response('invalid json', { status: 400 });
	}
	if (
		body.action !== 'sendMessage' ||
		typeof body.sessionId !== 'string' ||
		body.sessionId.length > 64 ||
		typeof body.chatInput !== 'string' ||
		body.chatInput.length === 0
	)
		return new Response('bad request', { status: 400 });

	const upstream = await fetch(WEBHOOK, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			action: 'sendMessage',
			sessionId: body.sessionId,
			chatInput: body.chatInput,
		}),
	});

	return new Response(upstream.body, {
		status: upstream.status,
		headers: {
			'Content-Type':
				upstream.headers.get('content-type') ?? 'application/json',
			'Cache-Control': 'no-cache, no-transform',
		},
	});
}
