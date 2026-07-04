/**
 * Graph compiler (doc 01): content collection → graph.json + constellation.svg.
 * Runs BEFORE astro build. The force layout is baked HERE, once — the SVG
 * poster and the runtime sim (session 4) both consume the same settled
 * positions and camera pose, which is what makes the poster→sim crossfade
 * seamless. Deterministic: seeded RNG + fixed initial positions, so a rebuild
 * without content changes produces byte-identical output.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
// @ts-expect-error d3-force-3d ships no types
import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force-3d';

const ROOT = join(import.meta.dir, '..');
const CONTENT_DIR = join(ROOT, 'src', 'content', 'projects');
const OUT_JSON = join(ROOT, 'src', 'generated', 'graph.json');
const OUT_SVG = join(ROOT, 'public', 'constellation.svg');

const HUB_ID = '__hub__';
const HUB_LABEL = 'PIYUSH TATER';

// ── read frontmatter ─────────────────────────────────────────────────────────

type Status = 'live' | 'dead' | 'paused';
interface Project {
	slug: string;
	title: string;
	status: Status;
	tags: string[];
	stack: string[];
}

const slugify = (s: string) =>
	s
		.toLowerCase()
		.trim()
		.replace(/[\s_]+/g, '-')
		.replace(/[^a-z0-9-]/g, '');

function readProjects(): Project[] {
	if (!existsSync(CONTENT_DIR)) return [];
	const projects: Project[] = [];
	for (const dir of readdirSync(CONTENT_DIR, { withFileTypes: true })) {
		if (!dir.isDirectory() || dir.name === '_template') continue;
		const file = join(CONTENT_DIR, dir.name, 'index.mdx');
		if (!existsSync(file)) continue;
		const raw = readFileSync(file, 'utf8');
		const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
		if (!m) continue; // no frontmatter — astro build will fail loudly, not our job
		const fm = parseYaml(m[1]) as Record<string, unknown>;
		projects.push({
			slug: dir.name,
			title: String(fm.title ?? dir.name),
			status: (fm.status as Status) ?? 'live',
			tags: Array.isArray(fm.tags) ? fm.tags.map((t) => slugify(String(t))) : [],
			stack: Array.isArray(fm.stack) ? fm.stack.map((s) => slugify(String(s))) : [],
		});
	}
	return projects.sort((a, b) => a.slug.localeCompare(b.slug));
}

// ── vocabulary drift guard ───────────────────────────────────────────────────

function warnSingleUse(projects: Project[], field: 'tags' | 'stack') {
	const counts = new Map<string, number>();
	for (const p of projects)
		for (const v of p[field]) counts.set(v, (counts.get(v) ?? 0) + 1);
	for (const [v, n] of counts)
		if (n === 1 && projects.length > 1)
			console.warn(
				`[graph] WARN single-use ${field} "${v}" — connects to nothing. Typo, or vocabulary drift (e.g. python vs py)?`
			);
}

// ── graph build ──────────────────────────────────────────────────────────────

interface GNode {
	id: string;
	kind: 'hub' | 'project';
	title: string;
	status?: Status;
	x: number;
	y: number;
	z: number;
	r: number;
}
interface GEdge {
	source: string;
	target: string;
	weight: number;
}

function overlap(a: string[], b: string[]) {
	const set = new Set(a);
	return b.filter((x) => set.has(x)).length;
}

// deterministic LCG (Numerical Recipes constants)
function lcg(seed: number) {
	let s = seed >>> 0;
	return () => {
		s = (s * 1664525 + 1013904223) >>> 0;
		return s / 2 ** 32;
	};
}

function buildGraph(projects: Project[]) {
	const nodes: GNode[] = [
		{ id: HUB_ID, kind: 'hub', title: HUB_LABEL, x: 0, y: 0, z: 0, r: 10 },
	];
	const edges: GEdge[] = [];

	for (const p of projects) {
		nodes.push({ id: p.slug, kind: 'project', title: p.title, status: p.status, x: 0, y: 0, z: 0, r: 6 });
		edges.push({ source: HUB_ID, target: p.slug, weight: 1 });
	}
	for (let i = 0; i < projects.length; i++)
		for (let j = i + 1; j < projects.length; j++) {
			const w =
				overlap(projects[i].tags, projects[j].tags) +
				overlap(projects[i].stack, projects[j].stack);
			if (w > 0) edges.push({ source: projects[i].slug, target: projects[j].slug, weight: w });
		}

	// degree-scaled radius so connected work reads heavier
	const degree = new Map<string, number>();
	for (const e of edges) {
		degree.set(e.source, (degree.get(e.source) ?? 0) + e.weight);
		degree.set(e.target, (degree.get(e.target) ?? 0) + e.weight);
	}
	for (const n of nodes)
		if (n.kind === 'project') n.r = 5 + Math.min(3, (degree.get(n.id) ?? 0) * 0.5);

	// fixed phyllotaxis initial positions (determinism), hub pinned at origin
	const golden = Math.PI * (3 - Math.sqrt(5));
	nodes.forEach((n, i) => {
		if (n.kind === 'hub') return;
		const k = i - 1;
		const y = projects.length > 1 ? 1 - (k / (projects.length - 1)) * 2 : 0;
		const rr = Math.sqrt(Math.max(0, 1 - y * y));
		n.x = Math.cos(golden * k) * rr * 30;
		n.y = y * 30;
		n.z = Math.sin(golden * k) * rr * 30;
	});

	const sim = forceSimulation(nodes as object[], 3)
		.randomSource(lcg(42))
		.force(
			'link',
			forceLink(edges.map((e) => ({ ...e })))
				.id((d: GNode) => d.id)
				.distance((l: GEdge) => 55 - Math.min(4, l.weight) * 8)
				.strength(0.9)
		)
		.force('charge', forceManyBody().strength(-60))
		.force('center', forceCenter(0, 0, 0))
		.stop();

	const hub = nodes[0];
	(hub as GNode & { fx?: number; fy?: number; fz?: number }).fx = 0;
	(hub as GNode & { fy?: number }).fy = 0;
	(hub as GNode & { fz?: number }).fz = 0;

	for (let i = 0; i < 300; i++) sim.tick();

	for (const n of nodes) {
		n.x = round(n.x);
		n.y = round(n.y);
		n.z = round(n.z);
	}
	return { nodes, edges };
}

const round = (v: number) => Math.round(v * 1000) / 1000;

// ── camera + ambient ─────────────────────────────────────────────────────────

function norm(v: number[]) {
	const l = Math.hypot(...v) || 1;
	return v.map((x) => x / l);
}
const cross = (a: number[], b: number[]) => [
	a[1] * b[2] - a[2] * b[1],
	a[2] * b[0] - a[0] * b[2],
	a[0] * b[1] - a[1] * b[0],
];
const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

function buildCameraAndAmbient(nodes: GNode[]) {
	const boundR = Math.max(30, ...nodes.map((n) => Math.hypot(n.x, n.y, n.z) + n.r));
	const dir = norm([0.35, 0.22, 1]);
	const camera = {
		position: dir.map((d) => round(d * boundR * 2.2)),
		target: [0, 0, 0],
		up: [0, 1, 0],
		orthoHalfHeight: round(boundR * 1.3),
	};

	const rand = lcg(7);
	const ambient: { x: number; y: number; z: number; r: number; o: number }[] = [];
	for (let i = 0; i < 140; i++) {
		const rr = boundR * (0.5 + rand() * 1.7);
		const theta = rand() * Math.PI * 2;
		const phi = Math.acos(2 * rand() - 1);
		ambient.push({
			x: round(rr * Math.sin(phi) * Math.cos(theta)),
			y: round(rr * Math.sin(phi) * Math.sin(theta) * 0.7),
			z: round(rr * Math.cos(phi)),
			r: round(0.5 + rand() * 0.9),
			o: round(0.04 + rand() * 0.14),
		});
	}
	return { camera, ambient, boundR };
}

// ── poster (orthographic projection, doc 01 projection contract) ─────────────

const W = 1200;
const H = 675;

const STATUS_COLOR: Record<Status, string> = {
	live: '#22D3EE',
	dead: '#C97070', // desaturated red-shift of --dead
	paused: '#9CA3AF',
};

function makeProjector(camera: ReturnType<typeof buildCameraAndAmbient>['camera']) {
	const fwd = norm(camera.target.map((t, i) => t - camera.position[i]));
	const right = norm(cross(fwd, camera.up));
	const upv = cross(right, fwd);
	const scale = H / 2 / camera.orthoHalfHeight;
	return (p: { x: number; y: number; z: number }) => {
		const rel = [p.x - camera.target[0], p.y - camera.target[1], p.z - camera.target[2]];
		return {
			x: round(W / 2 + dot(rel, right) * scale),
			y: round(H / 2 - dot(rel, upv) * scale),
			depth: dot(rel, fwd),
		};
	};
}

function renderPoster(
	nodes: GNode[],
	edges: GEdge[],
	camera: ReturnType<typeof buildCameraAndAmbient>['camera'],
	ambient: ReturnType<typeof buildCameraAndAmbient>['ambient']
) {
	const proj = makeProjector(camera);
	const pos = new Map(nodes.map((n) => [n.id, proj(n)]));

	const ambientDots = ambient
		.map((a) => {
			const p = proj(a);
			return `<circle cx="${p.x}" cy="${p.y}" r="${a.r}" fill="#22D3EE" opacity="${a.o}"/>`;
		})
		.join('');

	const edgeLines = edges
		.map((e) => {
			const s = pos.get(e.source)!;
			const t = pos.get(e.target)!;
			const o = Math.min(0.35, 0.12 + e.weight * 0.06);
			const w = Math.min(2, 0.75 + e.weight * 0.25);
			return `<line x1="${s.x}" y1="${s.y}" x2="${t.x}" y2="${t.y}" stroke="#22D3EE" stroke-width="${w}" opacity="${o}"/>`;
		})
		.join('');

	const nodeDots = nodes
		.map((n) => {
			const p = pos.get(n.id)!;
			if (n.kind === 'hub') {
				// no text label: the hero wordmark overlays the poster and IS the
				// hub label; the runtime sim adds interactive labels (session 4)
				return (
					`<circle cx="${p.x}" cy="${p.y}" r="${n.r * 2.6}" fill="#22D3EE" opacity="0.10"/>` +
					`<circle cx="${p.x}" cy="${p.y}" r="${n.r}" fill="#F4F4F5"/>` +
					`<circle cx="${p.x}" cy="${p.y}" r="${n.r * 0.45}" fill="#22D3EE"/>`
				);
			}
			const color = STATUS_COLOR[n.status ?? 'live'];
			const coreOpacity = n.status === 'paused' ? 0.4 : 1;
			return (
				`<circle cx="${p.x}" cy="${p.y}" r="${n.r * 2.4}" fill="${color}" opacity="0.10"/>` +
				`<circle cx="${p.x}" cy="${p.y}" r="${n.r}" fill="${color}" opacity="${coreOpacity}"/>`
			);
		})
		.join('');

	return (
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Constellation map of projects">` +
		ambientDots +
		edgeLines +
		nodeDots +
		`</svg>`
	);
}

// ── main ─────────────────────────────────────────────────────────────────────

const projects = readProjects();
warnSingleUse(projects, 'tags');
warnSingleUse(projects, 'stack');

const { nodes, edges } = buildGraph(projects);
const { camera, ambient } = buildCameraAndAmbient(nodes);

mkdirSync(join(ROOT, 'src', 'generated'), { recursive: true });
writeFileSync(
	OUT_JSON,
	JSON.stringify({ nodes, edges, camera, ambient, poster: { width: W, height: H } }, null, '\t')
);
writeFileSync(OUT_SVG, renderPoster(nodes, edges, camera, ambient));

console.log(
	`[graph] ${projects.length} project(s) → ${nodes.length} nodes, ${edges.length} edges → graph.json + constellation.svg`
);
