/**
 * Beta-access instructions modal — opened when a visitor clicks a
 * "Request beta access" link (node card or case page). Shows only the
 * instructions for what the application email must contain, plus the
 * address to send it to and a CTA that opens the prefilled draft.
 *
 * Deliberately a sibling of node-card, not a generalization of it: the
 * scaffold (layer, focus trap, Escape, backdrop click, reduced motion)
 * is cloned, but this modal is static-content-only and must also work on
 * case pages where node-card never loads. It can stack ABOVE an open node
 * card: the layer sits at z-index 30 (node card is 20) and the keydown
 * listener runs in the capture phase with stopPropagation, so Escape and
 * Tab are consumed here before node-card's bubble-phase handlers see them.
 */
import { BETA_EMAIL, BETA_INSTRUCTIONS } from '../lib/beta-access';

export interface BetaModalOpts {
	mailto: string;
	projectTitle?: string;
}

interface BetaModal {
	open(opts: BetaModalOpts): void;
	close(): void;
	dispose(): void;
}

const CSS = `
.beta-layer {
	position: fixed;
	inset: 0;
	z-index: 30;
	display: grid;
	place-items: center;
	padding: 1rem;
	background: color-mix(in srgb, var(--bg) 72%, transparent);
	opacity: 0;
	transition: opacity var(--duration-micro) var(--ease-out);
}
.beta-layer.is-open {
	opacity: 1;
}
.beta-layer[hidden] {
	display: none;
}
.beta-card {
	width: min(480px, 100%);
	max-height: calc(100dvh - 2rem);
	overflow-y: auto;
	background: var(--bg-raised);
	border: 1px solid var(--hairline);
	border-radius: var(--radius);
	font-family: var(--font-mono);
	transform: translateY(10px);
	transition: transform var(--duration-micro) var(--ease-out);
}
.beta-layer.is-open .beta-card {
	transform: none;
}
.beta-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0.6rem 0.9rem;
	border-bottom: 1px solid var(--hairline);
}
.beta-kicker {
	font-size: 0.7rem;
	letter-spacing: 0.14em;
	color: var(--text-dim);
}
.beta-close {
	background: transparent;
	border: 1px solid transparent;
	border-radius: var(--radius);
	color: var(--text-dim);
	font: inherit;
	font-size: 1rem;
	line-height: 1;
	min-width: 44px;
	min-height: 44px;
	margin: -10px -10px -10px 0;
	cursor: pointer;
	transition: color var(--duration-micro) var(--ease-out);
}
.beta-close:hover { color: var(--text); }
.beta-body {
	padding: 1.1rem 0.9rem;
	font-size: 0.8rem;
	color: var(--text-dim);
	line-height: 1.55;
}
.beta-body p { margin: 0 0 0.7rem; }
.beta-body ol {
	margin: 0;
	padding-left: 1.2rem;
	display: flex;
	flex-direction: column;
	gap: 0.35rem;
}
.beta-body li::marker { color: var(--accent); }
.beta-send {
	margin: 0.9rem 0 0;
	color: var(--text);
}
.beta-send a { color: var(--accent); text-decoration: none; }
.beta-send a:hover { text-decoration: underline; }
.beta-foot {
	display: flex;
	justify-content: flex-end;
	padding: 0.6rem 0.9rem;
	border-top: 1px solid var(--hairline);
}
.beta-foot a {
	display: inline-flex;
	align-items: center;
	min-height: 44px;
	padding-inline: 0.9rem;
	color: var(--accent);
	text-decoration: none;
	font-size: 0.8rem;
	letter-spacing: 0.06em;
	border: 1px solid color-mix(in srgb, var(--accent) 35%, var(--hairline));
	border-radius: var(--radius);
}
.beta-foot a:hover { text-decoration: underline; }
.beta-card :is(a, button):focus-visible {
	outline: 2px solid var(--accent);
	outline-offset: 2px;
}
@media (max-width: 560px) {
	.beta-layer { align-items: end; padding: 0; }
	.beta-card {
		width: 100%;
		max-height: 88dvh;
		border-radius: var(--radius) var(--radius) 0 0;
		border-inline: 0;
		border-bottom: 0;
	}
}
`;

const esc = (s: string) =>
	s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// only ever open a mail draft from here — never a live web/js URL
const safeMailto = (u: string) => (u.startsWith('mailto:') ? u : `mailto:${BETA_EMAIL}`);

let instance: BetaModal | null = null;

/** Singleton — node card and case page share one modal. */
export function betaAccessModal(): BetaModal {
	instance ??= create();
	return instance;
}

function create(): BetaModal {
	const style = document.createElement('style');
	style.textContent = CSS;
	document.head.appendChild(style);

	const layer = document.createElement('div');
	layer.className = 'beta-layer';
	layer.hidden = true;

	const card = document.createElement('div');
	card.className = 'beta-card';
	card.setAttribute('role', 'dialog');
	card.setAttribute('aria-modal', 'true');
	card.setAttribute('aria-labelledby', 'beta-title');
	layer.appendChild(card);
	document.body.appendChild(layer);

	let lastFocus: HTMLElement | null = null;
	let hideTimer = 0;

	function render(opts: BetaModalOpts) {
		const items = BETA_INSTRUCTIONS.map((i) => `<li>${esc(i)}</li>`).join('');
		card.innerHTML = `
			<div class="beta-head">
				<span class="beta-kicker" id="beta-title">REQUEST BETA ACCESS</span>
				<button class="beta-close" type="button" aria-label="Close">✕</button>
			</div>
			<div class="beta-body">
				<p>${opts.projectTitle ? `${esc(opts.projectTitle)} is` : 'This project is'} in private beta. Access is granted per request — send an email that includes:</p>
				<ol>${items}</ol>
				<p class="beta-send">Send to: <a href="mailto:${esc(BETA_EMAIL)}">${esc(BETA_EMAIL)}</a></p>
			</div>
			<div class="beta-foot">
				<a href="${esc(safeMailto(opts.mailto))}">open email draft →</a>
			</div>`;
		card.querySelector('.beta-close')!.addEventListener('click', close);
	}

	// capture phase: consume Escape/Tab before node-card's bubble listener
	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.stopPropagation();
			close();
			return;
		}
		if (e.key !== 'Tab') return;
		e.stopPropagation();
		const focusables = card.querySelectorAll<HTMLElement>('a[href], button');
		if (focusables.length === 0) return;
		const first = focusables[0];
		const last = focusables[focusables.length - 1];
		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		}
	}

	function onLayerClick(e: MouseEvent) {
		if (e.target === layer) close();
	}

	function open(opts: BetaModalOpts) {
		clearTimeout(hideTimer);
		render(opts);
		if (layer.hidden) lastFocus = document.activeElement as HTMLElement | null;
		layer.hidden = false;
		requestAnimationFrame(() => layer.classList.add('is-open'));
		card.querySelector<HTMLElement>('.beta-close')?.focus();
		document.addEventListener('keydown', onKeydown, { capture: true });
		layer.addEventListener('click', onLayerClick);
	}

	function close() {
		document.removeEventListener('keydown', onKeydown, { capture: true });
		layer.removeEventListener('click', onLayerClick);
		layer.classList.remove('is-open');
		hideTimer = window.setTimeout(() => {
			layer.hidden = true;
		}, 220);
		lastFocus?.focus();
		lastFocus = null;
	}

	function dispose() {
		close();
		clearTimeout(hideTimer);
		layer.remove();
		style.remove();
		instance = null;
	}

	return { open, close, dispose };
}
