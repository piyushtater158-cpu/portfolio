/**
 * Mascot chat — the system's front desk. A fixed robot avatar in the
 * bottom-left corner; click → wave → compact chat panel wired to the n8n
 * chat webhook (streaming NDJSON: begin/item/end frames, item.content is
 * the token chunk; a plain {output} JSON body is handled as fallback).
 *
 * JS-only progressive enhancement: loaded lazily from Base.astro after the
 * page is idle, never on the no-JS path. The mailto/LinkedIn footer stays
 * the baseline contact route.
 */
import { site } from '../config';

interface Msg {
	role: 'user' | 'bot';
	text: string;
}

// robot render size + hand-layer geometry (fractions of the body box),
// measured from the generated mascot-full/mascot-hand assets
const BTN_W = 88;
const BTN_H = 133;
const HAND = { left: 0.7419, top: 0.0983, width: 0.2473 };

const STORE_MSGS = 'mascot-chat-msgs';
const STORE_SESSION = 'mascot-chat-session';
const STORE_GREETED = 'mascot-chat-greeted';
const MAX_STORED = 40;

const CSS = `
.mascot-btn {
	/* hand geometry (fractions of the button box) — set from the generated
	   assets by scripts that bake mascot-full/mascot-hand; see PR notes */
	--hand-left: ${HAND.left};
	--hand-top: ${HAND.top};
	--hand-w: ${HAND.width};
	position: fixed;
	right: 1rem;
	bottom: 0.75rem;
	z-index: 15;
	width: ${BTN_W}px;
	height: ${BTN_H}px;
	padding: 0;
	border: 0;
	background: transparent;
	cursor: pointer;
	animation: mc-bob 4.5s var(--ease-in-out) infinite;
	filter: drop-shadow(0 6px 14px color-mix(in srgb, var(--bg) 70%, transparent));
	transition: filter var(--duration-micro) var(--ease-out);
}
.mascot-btn .m-body {
	display: block;
	width: 100%;
	height: 100%;
}
.mascot-btn .m-hand {
	position: absolute;
	left: calc(var(--hand-left) * 100%);
	top: calc(var(--hand-top) * 100%);
	width: calc(var(--hand-w) * 100%);
	transform-origin: 50% 88%;
	animation: mc-hand-sway 3.2s var(--ease-in-out) infinite;
}
.mascot-btn:hover {
	filter: drop-shadow(0 0 16px color-mix(in srgb, var(--accent-2) 45%, transparent));
}
.mascot-btn:focus-visible {
	outline: 2px solid var(--accent);
	outline-offset: 4px;
	border-radius: var(--radius);
}
.mascot-btn.is-waving .m-hand {
	animation: mc-hand-wave 0.9s var(--ease-in-out);
}
@keyframes mc-bob {
	0%, 100% { transform: translateY(0); }
	50% { transform: translateY(-5px); }
}
@keyframes mc-hand-sway {
	0%, 100% { transform: rotate(-5deg); }
	50% { transform: rotate(7deg); }
}
@keyframes mc-hand-wave {
	0%, 100% { transform: rotate(0); }
	20% { transform: rotate(-18deg); }
	45% { transform: rotate(16deg); }
	70% { transform: rotate(-14deg); }
	88% { transform: rotate(10deg); }
}
@media (prefers-reduced-motion: reduce) {
	.mascot-btn, .mascot-btn .m-hand, .mascot-btn.is-waving .m-hand { animation: none; }
}
.mascot-hi {
	position: fixed;
	right: calc(1rem + ${BTN_W}px + 0.6rem);
	bottom: calc(0.75rem + ${Math.round(BTN_H * 0.55)}px);
	z-index: 15;
	padding: 0.45rem 0.7rem;
	background: var(--bg-raised);
	border: 1px solid var(--hairline);
	border-radius: var(--radius);
	font-family: var(--font-mono);
	font-size: 0.7rem;
	letter-spacing: 0.06em;
	color: var(--text-dim);
	opacity: 0;
	transform: translateX(6px);
	transition: opacity var(--duration-reveal) var(--ease-out),
		transform var(--duration-reveal) var(--ease-out);
	pointer-events: none;
}
.mascot-hi.is-in { opacity: 1; transform: none; }
.mascot-hi .wave { color: var(--accent); }
.mascot-panel {
	position: fixed;
	right: 1rem;
	bottom: calc(0.75rem + ${BTN_H}px + 0.6rem);
	z-index: 15;
	display: flex;
	flex-direction: column;
	width: min(360px, calc(100vw - 2rem));
	height: min(480px, calc(100dvh - ${BTN_H}px - 3rem));
	background: var(--bg-raised);
	border: 1px solid var(--hairline);
	border-radius: var(--radius);
	font-family: var(--font-mono);
	opacity: 0;
	transform: translateY(10px);
	transition: opacity var(--duration-micro) var(--ease-out),
		transform var(--duration-micro) var(--ease-out);
}
.mascot-panel.is-open { opacity: 1; transform: none; }
.mascot-panel[hidden] { display: none; }
.mc-head {
	display: flex;
	align-items: center;
	gap: 0.55rem;
	padding: 0.55rem 0.5rem 0.55rem 0.8rem;
	border-bottom: 1px solid var(--hairline);
}
.mc-head img {
	width: 26px;
	height: 26px;
	border-radius: 50%;
	border: 1px solid var(--hairline);
}
.mc-kicker {
	flex: 1;
	font-size: 0.7rem;
	letter-spacing: 0.14em;
	color: var(--text-dim);
}
.mc-kicker .dot { color: var(--accent); }
.mc-close {
	background: transparent;
	border: 1px solid transparent;
	border-radius: var(--radius);
	color: var(--text-dim);
	font: inherit;
	font-size: 1rem;
	line-height: 1;
	min-width: 44px;
	min-height: 44px;
	cursor: pointer;
	transition: color var(--duration-micro) var(--ease-out);
}
.mc-close:hover { color: var(--text); }
.mc-log {
	flex: 1;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	padding: 0.8rem;
	overscroll-behavior: contain;
}
.mc-msg {
	max-width: 86%;
	padding: 0.5rem 0.65rem;
	border-radius: var(--radius);
	font-family: var(--font-body);
	font-size: var(--text-sm);
	line-height: 1.5;
	white-space: pre-wrap;
	overflow-wrap: break-word;
}
.mc-msg.user {
	align-self: flex-end;
	background: color-mix(in srgb, var(--accent) 14%, var(--bg));
	border: 1px solid color-mix(in srgb, var(--accent) 30%, var(--hairline));
	color: var(--text);
}
.mc-msg.bot {
	align-self: flex-start;
	background: var(--bg);
	border: 1px solid var(--hairline);
	color: var(--text);
}
.mc-msg.error {
	align-self: flex-start;
	border: 1px solid color-mix(in srgb, var(--dead) 45%, var(--hairline));
	background: var(--bg);
	color: var(--dead);
	font-family: var(--font-mono);
	font-size: 0.72rem;
}
.mc-typing {
	align-self: flex-start;
	display: flex;
	gap: 4px;
	padding: 0.6rem 0.65rem;
}
.mc-typing span {
	width: 5px;
	height: 5px;
	border-radius: 50%;
	background: var(--accent);
	animation: mc-blink 1.1s var(--ease-in-out) infinite;
}
.mc-typing span:nth-child(2) { animation-delay: 0.18s; }
.mc-typing span:nth-child(3) { animation-delay: 0.36s; }
@keyframes mc-blink {
	0%, 100% { opacity: 0.25; }
	50% { opacity: 1; }
}
.mc-form {
	display: flex;
	align-items: flex-end;
	gap: 0.4rem;
	padding: 0.5rem;
	border-top: 1px solid var(--hairline);
}
.mc-input {
	flex: 1;
	resize: none;
	max-height: 96px;
	padding: 0.55rem 0.6rem;
	background: var(--bg);
	border: 1px solid var(--hairline);
	border-radius: var(--radius);
	color: var(--text);
	font-family: var(--font-body);
	font-size: var(--text-sm);
	line-height: 1.4;
}
.mc-input:focus-visible { outline: 2px solid var(--accent); outline-offset: 0; }
.mc-send {
	min-width: 44px;
	min-height: 44px;
	border: 1px solid var(--hairline);
	border-radius: var(--radius);
	background: transparent;
	color: var(--accent);
	font: inherit;
	font-size: 1rem;
	cursor: pointer;
	transition: border-color var(--duration-micro) var(--ease-out),
		color var(--duration-micro) var(--ease-out);
}
.mc-send:hover:not(:disabled) {
	border-color: color-mix(in srgb, var(--accent) 45%, var(--hairline));
}
.mc-send:disabled { color: var(--text-dim); cursor: default; opacity: 0.5; }
.mascot-panel :is(button, textarea):focus-visible {
	outline: 2px solid var(--accent);
	outline-offset: 2px;
}
@media (max-width: 560px) {
	.mascot-panel {
		left: 0.75rem;
		right: 0.75rem;
		width: auto;
		height: min(480px, calc(100dvh - ${BTN_H}px - 2.5rem));
	}
}
`;

const esc = (s: string) =>
	s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function sessionId(): string {
	let id = sessionStorage.getItem(STORE_SESSION);
	if (!id) {
		id = crypto.randomUUID();
		sessionStorage.setItem(STORE_SESSION, id);
	}
	return id;
}

function loadMsgs(): Msg[] {
	try {
		const raw = sessionStorage.getItem(STORE_MSGS);
		const parsed: unknown = raw ? JSON.parse(raw) : [];
		if (!Array.isArray(parsed)) return [];
		return parsed.filter(
			(m): m is Msg =>
				!!m &&
				(m.role === 'user' || m.role === 'bot') &&
				typeof m.text === 'string'
		);
	} catch {
		return [];
	}
}

function saveMsgs(msgs: Msg[]) {
	try {
		sessionStorage.setItem(STORE_MSGS, JSON.stringify(msgs.slice(-MAX_STORED)));
	} catch {
		/* storage full/blocked — chat still works, history just won't persist */
	}
}

/**
 * POST to the n8n chat webhook and stream the reply. Calls onChunk with the
 * text accumulated so far; resolves with the final text.
 */
async function askWebhook(
	text: string,
	onChunk: (soFar: string) => void
): Promise<string> {
	const res = await fetch(site.chat.webhook, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			action: 'sendMessage',
			sessionId: sessionId(),
			chatInput: text,
		}),
	});
	if (!res.ok) throw new Error(`webhook ${res.status}`);
	if (!res.body) throw new Error('empty response');

	const reader = res.body.getReader();
	const decoder = new TextDecoder();
	let buffer = '';
	let out = '';
	let sawStream = false;

	const eat = (line: string) => {
		const t = line.trim();
		if (!t) return;
		try {
			const frame: unknown = JSON.parse(t);
			const f = frame as { type?: string; content?: unknown };
			if (f.type === 'item' && typeof f.content === 'string') {
				sawStream = true;
				out += f.content;
				onChunk(out);
			} else if (f.type === 'begin' || f.type === 'end' || f.type === 'error') {
				sawStream = true;
			}
		} catch {
			/* not a stream frame — handled by the whole-body fallback below */
		}
	};

	for (;;) {
		const { done, value } = await reader.read();
		if (done) break;
		buffer += decoder.decode(value, { stream: true });
		const lines = buffer.split('\n');
		buffer = lines.pop() ?? '';
		for (const line of lines) eat(line);
	}
	buffer += decoder.decode();
	if (buffer) eat(buffer);

	// non-streaming webhook config returns one JSON body: {output: "..."}
	if (!sawStream && !out) {
		try {
			const body: unknown = JSON.parse(buffer);
			const b = body as { output?: unknown; text?: unknown; message?: unknown };
			const v = [b.output, b.text, b.message].find((x) => typeof x === 'string');
			if (v) out = v as string;
		} catch {
			out = buffer;
		}
		if (out) onChunk(out);
	}
	if (!out) throw new Error('empty reply');
	return out;
}

interface MascotChat {
	dispose(): void;
}

let instance: MascotChat | null = null;

/** Singleton — one mascot per document. */
export function mascotChat(): MascotChat {
	instance ??= create();
	return instance;
}

function create(): MascotChat {
	const style = document.createElement('style');
	style.textContent = CSS;
	document.head.appendChild(style);

	const btn = document.createElement('button');
	btn.type = 'button';
	btn.className = 'mascot-btn';
	btn.setAttribute('aria-label', 'Chat with the site assistant');
	btn.setAttribute('aria-expanded', 'false');
	btn.innerHTML = `
		<img class="m-body" src="/mascot-full.webp" alt="" width="${BTN_W}" height="${BTN_H}">
		<img class="m-hand" src="/mascot-hand.webp" alt="" aria-hidden="true">`;

	const hi = document.createElement('div');
	hi.className = 'mascot-hi';
	hi.setAttribute('aria-hidden', 'true');
	hi.innerHTML = `<span class="wave">▸</span> hi — ask me anything`;

	const panel = document.createElement('div');
	panel.className = 'mascot-panel';
	panel.hidden = true;
	panel.setAttribute('role', 'dialog');
	panel.setAttribute('aria-label', 'Site assistant chat');
	panel.innerHTML = `
		<div class="mc-head">
			<img src="/mascot.webp" alt="" width="26" height="26">
			<span class="mc-kicker"><span class="dot">●</span> SYSTEM CHAT</span>
			<button class="mc-close" type="button" aria-label="Close chat">✕</button>
		</div>
		<div class="mc-log" aria-live="polite"></div>
		<form class="mc-form">
			<textarea class="mc-input" rows="1" placeholder="ask about the work…" aria-label="Message"></textarea>
			<button class="mc-send" type="submit" aria-label="Send">▸</button>
		</form>`;

	document.body.append(btn, hi, panel);

	const log = panel.querySelector<HTMLElement>('.mc-log')!;
	const form = panel.querySelector<HTMLFormElement>('.mc-form')!;
	const input = panel.querySelector<HTMLTextAreaElement>('.mc-input')!;
	const send = panel.querySelector<HTMLButtonElement>('.mc-send')!;

	let msgs = loadMsgs();
	let busy = false;
	let hideTimer = 0;
	let hiTimer = 0;

	const scrollToEnd = () => {
		log.scrollTop = log.scrollHeight;
	};

	function bubble(role: Msg['role'] | 'error', text: string): HTMLElement {
		const el = document.createElement('div');
		el.className = `mc-msg ${role}`;
		el.innerHTML = esc(text);
		log.appendChild(el);
		scrollToEnd();
		return el;
	}

	function renderHistory() {
		log.innerHTML = '';
		if (msgs.length === 0)
			bubble('bot', "Hi, I'm the resident bot 🤖 Ask me anything about Piyush's work, stack, or projects.");
		else for (const m of msgs) bubble(m.role, m.text);
	}

	async function submit() {
		const text = input.value.trim();
		if (!text || busy) return;
		busy = true;
		send.disabled = true;
		input.value = '';
		input.style.height = '';

		msgs.push({ role: 'user', text });
		saveMsgs(msgs);
		bubble('user', text);

		const typing = document.createElement('div');
		typing.className = 'mc-typing';
		typing.innerHTML = '<span></span><span></span><span></span>';
		log.appendChild(typing);
		scrollToEnd();

		let botEl: HTMLElement | null = null;
		try {
			const reply = await askWebhook(text, (soFar) => {
				typing.remove();
				botEl ??= bubble('bot', '');
				botEl.innerHTML = esc(soFar);
				scrollToEnd();
			});
			msgs.push({ role: 'bot', text: reply });
			saveMsgs(msgs);
		} catch {
			typing.remove();
			botEl?.remove();
			bubble('error', 'connection failed — try again in a moment, or use the contact links below.');
		} finally {
			busy = false;
			send.disabled = false;
			input.focus();
		}
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}

	function open() {
		clearTimeout(hideTimer);
		dismissHi();
		renderHistory();
		panel.hidden = false;
		btn.setAttribute('aria-expanded', 'true');
		// next frame so the opacity/transform transition actually runs
		requestAnimationFrame(() => panel.classList.add('is-open'));
		scrollToEnd();
		input.focus();
		document.addEventListener('keydown', onKeydown);
	}

	function close() {
		document.removeEventListener('keydown', onKeydown);
		panel.classList.remove('is-open');
		btn.setAttribute('aria-expanded', 'false');
		hideTimer = window.setTimeout(() => {
			panel.hidden = true;
		}, 220);
		btn.focus();
	}

	function toggle() {
		if (!panel.hidden) {
			close();
			return;
		}
		// wave first, then open — the welcome beat
		btn.classList.remove('is-waving');
		void btn.offsetWidth; // restart the animation if mid-run
		btn.classList.add('is-waving');
		const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
		window.setTimeout(open, reduced ? 0 : 450);
	}

	function dismissHi() {
		clearTimeout(hiTimer);
		hi.classList.remove('is-in');
		try {
			sessionStorage.setItem(STORE_GREETED, '1');
		} catch {
			/* ignore */
		}
	}

	btn.addEventListener('click', toggle);
	btn.addEventListener('animationend', (e) => {
		if (e.animationName === 'mc-hand-wave') btn.classList.remove('is-waving');
	});
	panel.querySelector('.mc-close')!.addEventListener('click', close);
	form.addEventListener('submit', (e) => {
		e.preventDefault();
		submit();
	});
	input.addEventListener('keydown', (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			submit();
		}
	});
	input.addEventListener('input', () => {
		input.style.height = 'auto';
		input.style.height = `${Math.min(input.scrollHeight, 96)}px`;
	});

	// greeting bubble: once per session, shortly after load, with a wave
	let greeted = false;
	try {
		greeted = sessionStorage.getItem(STORE_GREETED) === '1';
	} catch {
		/* ignore */
	}
	if (!greeted) {
		hiTimer = window.setTimeout(() => {
			hi.classList.add('is-in');
			btn.classList.add('is-waving');
			window.setTimeout(() => btn.classList.remove('is-waving'), 950);
			hiTimer = window.setTimeout(dismissHi, 6000);
		}, 1600);
	}

	function dispose() {
		clearTimeout(hideTimer);
		clearTimeout(hiTimer);
		document.removeEventListener('keydown', onKeydown);
		btn.remove();
		hi.remove();
		panel.remove();
		style.remove();
		instance = null;
	}

	return { dispose };
}
