/**
 * Hero simulation island (doc 01). Loaded ONLY by the gate controller —
 * never on static/reduced-motion paths. Consumes the same baked layout and
 * camera pose as the SVG poster (graph.json), and reproduces the poster's
 * orthographic contain-mapping exactly, so the crossfade never moves a node.
 * v1 camera choreography is ONE move: scroll progress dollies (ortho zoom)
 * into the cluster. Mobile tap mode animates in place — dolly disabled.
 */
import * as THREE from 'three';
// @ts-expect-error d3-force-3d ships no types
import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force-3d';
import graph from '../generated/graph.json';

interface SimOptions {
	mount: HTMLElement;
	budget: number;
	dolly: boolean;
	interactive: boolean;
}

const POSTER_W = 1200;
const POSTER_H = 675;

const STATUS_COLOR: Record<string, number> = {
	live: 0x22d3ee,
	dead: 0xc97070,
	paused: 0x9ca3af,
};
const VIOLET = new THREE.Color(0x8b5cf6);
const CYAN = new THREE.Color(0x22d3ee);

function glowTexture(): THREE.Texture {
	const c = document.createElement('canvas');
	c.width = c.height = 64;
	const ctx = c.getContext('2d')!;
	const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
	g.addColorStop(0, 'rgba(255,255,255,1)');
	g.addColorStop(0.35, 'rgba(255,255,255,0.6)');
	g.addColorStop(1, 'rgba(255,255,255,0)');
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, 64, 64);
	const tex = new THREE.CanvasTexture(c);
	tex.colorSpace = THREE.SRGBColorSpace;
	return tex;
}

export function startHeroSim({ mount, budget, dolly, interactive }: SimOptions) {
	const nodes = graph.nodes.map((n) => ({ ...n }));
	const edges = graph.edges.map((e) => ({ ...e }));
	const cam = graph.camera;

	// ── renderer ───────────────────────────────────────────────────────────
	const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.domElement.className = 'hero-canvas';
	mount.appendChild(renderer.domElement);

	const scene = new THREE.Scene();

	const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 5000);
	camera.position.set(cam.position[0], cam.position[1], cam.position[2]);
	camera.up.set(cam.up[0], cam.up[1], cam.up[2]);
	camera.lookAt(cam.target[0], cam.target[1], cam.target[2]);

	let zoom = 1;
	function sizeCamera() {
		const cw = mount.clientWidth;
		const ch = mount.clientHeight;
		renderer.setSize(cw, ch);
		// reproduce the poster's contain mapping (projection contract, doc 01)
		const s = Math.min(cw / POSTER_W, ch / POSTER_H);
		const pxPerWorld = (s * (POSTER_H / 2)) / cam.orthoHalfHeight;
		const halfW = cw / 2 / pxPerWorld / zoom;
		const halfH = ch / 2 / pxPerWorld / zoom;
		camera.left = -halfW;
		camera.right = halfW;
		camera.top = halfH;
		camera.bottom = -halfH;
		camera.updateProjectionMatrix();
	}
	sizeCamera();

	// ── nodes (sprites: dot + glow in one radial texture) ─────────────────
	const tex = glowTexture();
	const sprites: THREE.Sprite[] = [];
	for (const n of nodes) {
		const isHub = n.kind === 'hub';
		const color = isHub ? 0xf4f4f5 : (STATUS_COLOR[n.status ?? 'live'] ?? 0x22d3ee);
		const mat = new THREE.SpriteMaterial({
			map: tex,
			color,
			transparent: true,
			opacity: n.status === 'paused' ? 0.4 : 0.95,
			depthWrite: false,
		});
		const sp = new THREE.Sprite(mat);
		const scale = (isHub ? n.r * 2.4 : n.r * 2.2) * (cam.orthoHalfHeight / (POSTER_H / 2));
		sp.scale.setScalar(scale);
		sp.position.set(n.x, n.y, n.z);
		sp.userData = { node: n, baseScale: scale, baseColor: new THREE.Color(color) };
		scene.add(sp);
		sprites.push(sp);
	}

	// ── edges ──────────────────────────────────────────────────────────────
	const nodeIndex = new Map(nodes.map((n, i) => [n.id, i]));
	const edgePos = new Float32Array(edges.length * 6);
	const edgeGeo = new THREE.BufferGeometry();
	edgeGeo.setAttribute('position', new THREE.BufferAttribute(edgePos, 3));
	const edgeMat = new THREE.LineBasicMaterial({
		color: CYAN,
		transparent: true,
		opacity: 0.16,
		blending: THREE.AdditiveBlending,
		depthWrite: false,
	});
	scene.add(new THREE.LineSegments(edgeGeo, edgeMat));

	// ── particles: laminar flow along edges + ambient drift ───────────────
	const flowCount = edges.length > 0 ? Math.floor(budget * 0.6) : 0;
	const ambientCount = budget - flowCount;
	const pGeo = new THREE.BufferGeometry();
	const pPos = new Float32Array(budget * 3);
	const pCol = new Float32Array(budget * 3);
	pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
	pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
	const pMat = new THREE.PointsMaterial({
		size: 2.2,
		map: tex,
		vertexColors: true,
		transparent: true,
		opacity: 0.85,
		blending: THREE.AdditiveBlending,
		depthWrite: false,
		sizeAttenuation: false,
	});
	scene.add(new THREE.Points(pGeo, pMat));

	interface Flow {
		edge: number;
		t: number;
		speed: number;
		lane: THREE.Vector3;
	}
	const flows: Flow[] = [];
	const rand = () => Math.random();
	for (let i = 0; i < flowCount; i++) {
		flows.push({
			edge: i % edges.length,
			t: rand(),
			speed: 0.0016 + rand() * 0.0022,
			lane: new THREE.Vector3((rand() - 0.5) * 3, (rand() - 0.5) * 3, (rand() - 0.5) * 3),
		});
		const c = CYAN.clone().multiplyScalar(0.55 + rand() * 0.45);
		pCol.set([c.r, c.g, c.b], i * 3);
	}
	const boundR = cam.orthoHalfHeight / 1.3;
	const ambient: { p: THREE.Vector3; v: THREE.Vector3 }[] = [];
	for (let i = 0; i < ambientCount; i++) {
		const p = new THREE.Vector3(
			(rand() * 2 - 1) * boundR * 1.9,
			(rand() * 2 - 1) * boundR * 1.2,
			(rand() * 2 - 1) * boundR * 1.9
		);
		ambient.push({
			p,
			v: new THREE.Vector3((rand() - 0.5) * 0.06, (rand() - 0.5) * 0.04, (rand() - 0.5) * 0.06),
		});
		const dim = 0.12 + rand() * 0.3;
		pCol.set([CYAN.r * dim, CYAN.g * dim, CYAN.b * dim], (flowCount + i) * 3);
	}

	// ── runtime force sim: breathe around the baked layout ────────────────
	const simNodes = nodes as (typeof nodes)[number][] & { fx?: number }[];
	const hub = nodes.find((n) => n.kind === 'hub') as (typeof nodes)[number] & {
		fx?: number;
		fy?: number;
		fz?: number;
	};
	hub.fx = hub.x;
	hub.fy = hub.y;
	hub.fz = hub.z;
	const fsim = forceSimulation(simNodes, 3)
		.force(
			'link',
			forceLink(edges).id((d: { id: string }) => d.id).distance(50).strength(0.6)
		)
		.force('charge', forceManyBody().strength(-40))
		.force('center', forceCenter(0, 0, 0))
		.alpha(0.05)
		.alphaTarget(0.02)
		.alphaDecay(0.001);

	// ── interaction: magnetism + hover bloom + click ───────────────────────
	const raycaster = new THREE.Raycaster();
	const pointerNdc = new THREE.Vector2(-10, -10);
	const pointerWorld = new THREE.Vector3();
	let pointerActive = false;
	let hovered: THREE.Sprite | null = null;
	const tooltip = document.createElement('div');
	tooltip.className = 'hero-tooltip';
	tooltip.hidden = true;
	mount.appendChild(tooltip);

	if (interactive) {
		mount.addEventListener('pointermove', (e) => {
			const r = renderer.domElement.getBoundingClientRect();
			pointerNdc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
			pointerActive = true;
			tooltip.style.left = `${e.clientX - r.left + 14}px`;
			tooltip.style.top = `${e.clientY - r.top + 10}px`;
		});
		mount.addEventListener('pointerleave', () => {
			pointerActive = false;
			pointerNdc.set(-10, -10);
		});
		renderer.domElement.addEventListener('click', () => {
			const n = hovered?.userData.node;
			if (n && n.kind === 'project') window.location.href = `/projects/${n.id}/`;
		});
	}

	// ── scroll dolly (native scroll; ONE camera move) ──────────────────────
	const section = mount.closest('section') ?? mount;
	const ease = (t: number) => 1 - Math.pow(1 - t, 3);
	function scrollProgress() {
		const range = (section as HTMLElement).offsetHeight - window.innerHeight;
		if (range <= 0) return 0;
		return Math.min(1, Math.max(0, window.scrollY / range));
	}

	// ── loop ───────────────────────────────────────────────────────────────
	let running = true;
	let disposed = false;
	const clock = new THREE.Clock();

	function frame() {
		if (disposed) return;
		requestAnimationFrame(frame);
		if (!running) return;
		const dt = Math.min(clock.getDelta(), 0.05);

		fsim.tick();

		// dolly
		const targetZoom = dolly ? 1 + ease(scrollProgress()) * 0.6 : 1;
		if (Math.abs(targetZoom - zoom) > 0.0005) {
			zoom += (targetZoom - zoom) * Math.min(1, dt * 8);
			sizeCamera();
		}

		// nodes + edges follow the breathing sim
		for (const sp of sprites) {
			const n = sp.userData.node;
			sp.position.set(n.x, n.y, n.z);
		}
		for (let i = 0; i < edges.length; i++) {
			const e = edges[i] as { source: { x: number; y: number; z: number }; target: { x: number; y: number; z: number } };
			edgePos.set([e.source.x, e.source.y, e.source.z, e.target.x, e.target.y, e.target.z], i * 6);
		}
		edgeGeo.attributes.position.needsUpdate = true;

		// pointer world position on the camera plane (for magnetism)
		if (pointerActive) {
			raycaster.setFromCamera(pointerNdc, camera);
			pointerWorld.copy(raycaster.ray.origin).addScaledVector(raycaster.ray.direction, camera.position.length());
		}

		// flow particles: laminar streams along edges
		const tmp = new THREE.Vector3();
		for (let i = 0; i < flows.length; i++) {
			const f = flows[i];
			f.t += f.speed * (dt * 60);
			if (f.t > 1) f.t -= 1;
			const e = edges[f.edge] as { source: { x: number; y: number; z: number }; target: { x: number; y: number; z: number } };
			tmp.set(
				e.source.x + (e.target.x - e.source.x) * f.t + f.lane.x,
				e.source.y + (e.target.y - e.source.y) * f.t + f.lane.y,
				e.source.z + (e.target.z - e.source.z) * f.t + f.lane.z
			);
			applyMagnetism(tmp);
			pPos.set([tmp.x, tmp.y, tmp.z], i * 3);
		}
		// ambient drift
		for (let i = 0; i < ambient.length; i++) {
			const a = ambient[i];
			a.p.addScaledVector(a.v, dt * 60);
			if (a.p.length() > boundR * 2.2) a.p.multiplyScalar(-0.9);
			tmp.copy(a.p);
			applyMagnetism(tmp);
			pPos.set([tmp.x, tmp.y, tmp.z], (flows.length + i) * 3);
		}
		pGeo.attributes.position.needsUpdate = true;

		// hover bloom (violet — the reactive accent)
		if (interactive && pointerActive) {
			raycaster.setFromCamera(pointerNdc, camera);
			const hits = raycaster.intersectObjects(sprites, false);
			const top = (hits[0]?.object as THREE.Sprite) ?? null;
			if (top !== hovered) {
				if (hovered) unbloom(hovered);
				hovered = top && top.userData.node.kind === 'project' ? top : null;
				if (hovered) bloom(hovered);
			}
		} else if (hovered) {
			unbloom(hovered);
			hovered = null;
		}

		renderer.render(scene, camera);
	}

	const MAG_R = boundR * 0.35;
	function applyMagnetism(p: THREE.Vector3) {
		if (!pointerActive || !interactive) return;
		const dx = pointerWorld.x - p.x;
		const dy = pointerWorld.y - p.y;
		const d2 = dx * dx + dy * dy;
		const r2 = MAG_R * MAG_R;
		if (d2 < r2 && d2 > 0.01) {
			const fall = (1 - d2 / r2) * 6;
			// bend toward the pointer with a slight swirl in its wake
			p.x += (dx * 0.04 + -dy * 0.025) * fall;
			p.y += (dy * 0.04 + dx * 0.025) * fall;
		}
	}

	function bloom(sp: THREE.Sprite) {
		(sp.material as THREE.SpriteMaterial).color.copy(VIOLET);
		sp.scale.setScalar(sp.userData.baseScale * 1.7);
		renderer.domElement.style.cursor = 'pointer';
		tooltip.textContent = sp.userData.node.title;
		tooltip.hidden = false;
	}
	function unbloom(sp: THREE.Sprite) {
		(sp.material as THREE.SpriteMaterial).color.copy(sp.userData.baseColor);
		sp.scale.setScalar(sp.userData.baseScale);
		renderer.domElement.style.cursor = '';
		tooltip.hidden = true;
	}

	// pause off-screen / hidden tab
	const io = new IntersectionObserver(([e]) => (running = e.isIntersecting), { threshold: 0 });
	io.observe(mount);
	document.addEventListener('visibilitychange', () => {
		running = !document.hidden;
	});

	window.addEventListener('resize', sizeCamera);

	// fade in over the poster after the first real frame (crossfade contract)
	renderer.render(scene, camera);
	requestAnimationFrame(() => renderer.domElement.classList.add('is-live'));
	frame();

	return () => {
		disposed = true;
		io.disconnect();
		renderer.dispose();
		renderer.domElement.remove();
	};
}
