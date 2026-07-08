/**
 * Node card — the inspect-a-node popup (doc 01 metaphor: examining one unit
 * of the running system). Opened by the hero sim on node click and by the
 * feed's progressive enhancement; never loaded on static/no-JS paths, where
 * the feed's plain links remain the route to every project.
 *
 * Layout mirrors the approved sample: identity (cover logo) top-left,
 * name + info rows top-right, platform links bottom-left, YouTube thumbnail
 * in the video area — only the thumbnail links out to YouTube; the card's
 * own CTA is the case study.
 */
import { thumbUrl, thumbUrlMax } from '../lib/youtube';

export interface CardLink {
	kind: 'repo' | 'linkedin' | 'live' | 'x' | 'other';
	label: string;
	url: string;
}
export interface CardData {
	outcome: string;
	date: string;
	tags: string[];
	stack: string[];
	links: CardLink[];
	yt?: { id: string; url: string };
	logo?: string;
}
export interface CardNode {
	id: string;
	title: string;
	status?: string;
	card?: CardData;
}

interface NodeCard {
	open(node: CardNode): void;
	close(): void;
	dispose(): void;
}

const ICONS: Record<CardLink['kind'], string> = {
	repo: '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="4.5" cy="3.5" r="1.8"/><circle cx="4.5" cy="12.5" r="1.8"/><circle cx="11.5" cy="6" r="1.8"/><path d="M4.5 5.3v5.4M11.5 7.8c0 2.5-4 2-6.2 3.2"/></svg>',
	linkedin:
		'<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2" y="2" width="12" height="12" rx="2"/><path d="M5.2 7v4M5.2 5v.01M8 11V8.6c0-1 .7-1.6 1.6-1.6s1.4.6 1.4 1.6V11"/></svg>',
	live: '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="6"/><path d="M2 8h12M8 2c2.5 2.8 2.5 9.2 0 12-2.5-2.8-2.5-9.2 0-12z"/></svg>',
	x: '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 3l10 10M13 3L3 13"/></svg>',
	other:
		'<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M6.5 9.5l3-3M5 8l-1.8 1.8a2.4 2.4 0 003.4 3.4L8.4 11.4M11 8l1.8-1.8a2.4 2.4 0 00-3.4-3.4L7.6 4.6"/></svg>',
};

const CSS = `
.node-card-layer {
	position: fixed;
	inset: 0;
	z-index: 20;
	display: grid;
	place-items: center;
	padding: 1rem;
	background: color-mix(in srgb, var(--bg) 72%, transparent);
	opacity: 0;
	transition: opacity var(--duration-micro) var(--ease-out);
}
.node-card-layer.is-open {
	opacity: 1;
}
/* author display:grid would otherwise beat the UA [hidden] rule */
.node-card-layer[hidden] {
	display: none;
}
.node-card {
	width: min(640px, 100%);
	max-height: calc(100dvh - 2rem);
	overflow-y: auto;
	background: var(--bg-raised);
	border: 1px solid var(--hairline);
	border-radius: var(--radius);
	font-family: var(--font-mono);
	transform: translateY(10px);
	transition: transform var(--duration-micro) var(--ease-out);
	animation: nc-breathe 3.2s var(--ease-in-out) infinite;
}
.node-card-layer.is-open .node-card {
	transform: none;
}
@keyframes nc-breathe {
	0%, 100% { box-shadow: 0 0 0 0 transparent; border-color: var(--hairline); }
	50% { box-shadow: 0 0 22px 0 color-mix(in srgb, var(--accent) 14%, transparent); border-color: color-mix(in srgb, var(--accent) 35%, var(--hairline)); }
}
@media (prefers-reduced-motion: reduce) {
	.node-card { animation: none; }
}
.nc-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0.6rem 0.9rem;
	border-bottom: 1px solid var(--hairline);
}
.nc-kicker {
	font-size: 0.7rem;
	letter-spacing: 0.14em;
	color: var(--text-dim);
}
.nc-close {
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
.nc-close:hover { color: var(--text); }
.nc-grid {
	display: grid;
	grid-template-columns: 180px 1fr;
	gap: 1.1rem;
	padding: 1.1rem 0.9rem;
}
.nc-logo {
	aspect-ratio: 4 / 3;
	display: grid;
	place-items: center;
	border: 1px solid var(--hairline);
	border-radius: var(--radius);
	background: var(--bg);
	overflow: hidden;
}
.nc-logo img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}
.nc-logo span {
	font-size: var(--text-lg);
	text-transform: uppercase;
	color: var(--accent);
}
.nc-logo.dead span { color: var(--dead); filter: saturate(0.6); }
.nc-logo.paused span { color: var(--text-dim); }
.nc-links {
	list-style: none;
	margin: 0.9rem 0 0;
	padding: 0;
	display: flex;
	flex-direction: column;
}
.nc-links a {
	display: flex;
	align-items: center;
	gap: 0.55rem;
	min-height: 44px;
	padding-inline: 0.2rem;
	color: var(--text-dim);
	text-decoration: none;
	font-size: 0.75rem;
	border-bottom: 1px solid var(--hairline);
	transition: color var(--duration-micro) var(--ease-out);
}
.nc-links li:last-child a { border-bottom: 0; }
.nc-links a:hover { color: var(--accent); }
.nc-links svg { flex: 0 0 auto; }
.nc-links .u {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.nc-title {
	margin: 0 0 0.6rem;
	font-size: var(--text-md);
	color: var(--text);
	letter-spacing: 0.02em;
}
.nc-rows {
	display: flex;
	flex-direction: column;
	gap: 0.35rem;
	font-size: 0.75rem;
	color: var(--text-dim);
}
.nc-rows .k { color: var(--text-dim); opacity: 0.7; margin-right: 0.5rem; }
.nc-rows .status-live { color: var(--accent); }
.nc-rows .status-dead { color: var(--dead); }
.nc-outcome {
	margin: 0.7rem 0 0;
	font-family: var(--font-body);
	font-size: var(--text-sm);
	color: var(--text);
	line-height: 1.5;
}
.nc-video {
	position: relative;
	display: block;
	margin-top: 0.9rem;
	aspect-ratio: 16 / 9;
	border: 1px solid var(--hairline);
	border-radius: var(--radius);
	overflow: hidden;
}
.nc-video img {
	width: 100%;
	height: 100%;
	object-fit: cover;
	filter: brightness(0.7);
}
.nc-video .play {
	position: absolute;
	inset: 0;
	display: grid;
	place-items: center;
	font-size: 1.6rem;
	color: var(--text);
	transition: color var(--duration-micro) var(--ease-out);
}
.nc-video:hover .play { color: var(--accent); }
.nc-foot {
	display: flex;
	justify-content: flex-end;
	padding: 0.6rem 0.9rem;
	border-top: 1px solid var(--hairline);
}
.nc-foot a {
	display: inline-flex;
	align-items: center;
	min-height: 44px;
	color: var(--accent);
	text-decoration: none;
	font-size: 0.8rem;
	letter-spacing: 0.06em;
}
.nc-foot a:hover { text-decoration: underline; }
.node-card :is(a, button):focus-visible {
	outline: 2px solid var(--accent);
	outline-offset: 2px;
}
@media (max-width: 560px) {
	.node-card-layer { align-items: end; padding: 0; }
	.node-card {
		width: 100%;
		max-height: 88dvh;
		border-radius: var(--radius) var(--radius) 0 0;
		border-inline: 0;
		border-bottom: 0;
	}
	.nc-grid { grid-template-columns: 1fr; }
	/* single column: name/info/video first, identity + links after */
	.nc-left { order: 2; }
	.nc-logo { max-width: 220px; }
}
`;

const esc = (s: string) =>
	s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// defense in depth behind build-graph's bake-time filter: esc() can't stop a
// javascript:/data: URL from being a live href, so only web URLs render
const safeUrl = (u: string) => (u.startsWith('https://') || u.startsWith('http://') ? u : '');

let instance: NodeCard | null = null;

/** Singleton — the hero sim and the feed share one card. */
export function nodeCard(): NodeCard {
	instance ??= create();
	return instance;
}

function create(): NodeCard {
	const style = document.createElement('style');
	style.textContent = CSS;
	document.head.appendChild(style);

	const layer = document.createElement('div');
	layer.className = 'node-card-layer';
	layer.hidden = true;

	const card = document.createElement('div');
	card.className = 'node-card';
	card.setAttribute('role', 'dialog');
	card.setAttribute('aria-modal', 'true');
	card.setAttribute('aria-labelledby', 'nc-title');
	layer.appendChild(card);
	document.body.appendChild(layer);

	let lastFocus: HTMLElement | null = null;
	let hideTimer = 0;

	function render(node: CardNode) {
		const c = node.card;
		const status = node.status ?? 'live';

		const logo = c?.logo
			? `<img src="${esc(c.logo)}" alt="" width="180" height="135">`
			: `<span>${esc(node.title.slice(0, 2))}</span>`;

		const linkRows = (c?.links ?? []).filter((l) => safeUrl(l.url));
		const links =
			linkRows.length > 0
				? `<ul class="nc-links">${linkRows
						.map(
							(l) =>
								`<li><a href="${esc(safeUrl(l.url))}" target="_blank" rel="noopener noreferrer">${ICONS[l.kind] ?? ICONS.other}<span class="u">${esc(l.label)}</span></a></li>`
						)
						.join('')}</ul>`
				: '';

		const rows = [
			`<div><span class="k">status</span><span class="status-${esc(status)}">${esc(status)}</span></div>`,
			c?.date ? `<div><span class="k">date</span>${esc(c.date)}</div>` : '',
			c?.tags.length ? `<div><span class="k">tags</span>${esc(c.tags.join(' · '))}</div>` : '',
			c?.stack.length ? `<div><span class="k">stack</span>${esc(c.stack.join(' · '))}</div>` : '',
		].join('');

		const video =
			c?.yt && safeUrl(c.yt.url)
				? `<a class="nc-video" href="${esc(safeUrl(c.yt.url))}" target="_blank" rel="noopener noreferrer" aria-label="Watch on YouTube">
					<img src="${esc(thumbUrlMax(c.yt.id))}" data-fallback="${esc(thumbUrl(c.yt.id))}" alt="" loading="lazy">
					<span class="play" aria-hidden="true">▶</span>
				</a>`
			: '';

		card.innerHTML = `
			<div class="nc-head">
				<span class="nc-kicker">PROJECT</span>
				<button class="nc-close" type="button" aria-label="Close">✕</button>
			</div>
			<div class="nc-grid">
				<div class="nc-left">
					<div class="nc-logo ${esc(status)}" aria-hidden="true">${logo}</div>
					${links}
				</div>
				<div class="nc-right">
					<h3 class="nc-title" id="nc-title">${esc(node.title)}</h3>
					<div class="nc-rows">${rows}</div>
					${c?.outcome ? `<p class="nc-outcome">${esc(c.outcome)}</p>` : ''}
					${video}
				</div>
			</div>
			<div class="nc-foot">
				<a href="/projects/${esc(node.id)}/">open case study →</a>
			</div>`;

		// maxres thumbnails 404 for non-HD uploads — fall back to hqdefault
		const thumb = card.querySelector<HTMLImageElement>('.nc-video img');
		if (thumb)
			thumb.addEventListener(
				'error',
				() => {
					if (thumb.dataset.fallback) thumb.src = thumb.dataset.fallback;
					delete thumb.dataset.fallback;
				},
				{ once: true }
			);

		card.querySelector('.nc-close')!.addEventListener('click', close);
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			close();
			return;
		}
		if (e.key !== 'Tab') return;
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

	function open(node: CardNode) {
		clearTimeout(hideTimer);
		render(node);
		// re-open while visible keeps the original restore target (the old
		// close button is already detached by the innerHTML swap)
		if (layer.hidden) lastFocus = document.activeElement as HTMLElement | null;
		layer.hidden = false;
		// next frame so the opacity/transform transition actually runs
		requestAnimationFrame(() => layer.classList.add('is-open'));
		card.querySelector<HTMLElement>('.nc-close')?.focus();
		document.addEventListener('keydown', onKeydown);
		layer.addEventListener('click', onLayerClick);
	}

	function close() {
		document.removeEventListener('keydown', onKeydown);
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
