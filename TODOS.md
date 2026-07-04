# Build checklist — Living System portfolio

Order is contractual (content system before spectacle). Full specs: docs/design/01 + 02, CLAUDE.md, DESIGN.md.

## Session 1 — Foundation ✅ (2026-07-04)
- [x] `bun create astro` scaffold (around existing CLAUDE.md/DESIGN.md/docs — do not overwrite)
- [x] `.gitignore` (.env, node_modules, dist, .astro) in first commit
- [x] Create PUBLIC GitHub repo, push, enable branch protection on main (require PR + Vercel check)
- [x] Connect Vercel, deployed placeholder live
- [x] Design tokens from DESIGN.md as CSS custom properties + fonts wired

## Session 2 — Content system (the product) — done 2026-07-04 except real content
- [x] Content collection + Zod schema (exact fields per doc 01)
- [x] `src/content/projects/_template/` (excluded from collection glob)
- [x] Case-study page template (dark, mobile-first, lite-embed YouTube, status treatments, CTA block)
- [x] Project feed (reverse-chron, all statuses, no-JS navigable)
- [x] Footer contact CTA on every page (LinkedIn URL pending in src/config.ts)
- [ ] Enter 3 real projects (BLOCKED on user content — never fabricate)
- [x] Verify: malformed frontmatter fails PR build with readable error (PR #5: names file, field, allowed values)
- [x] Verify: 15-minute Tuesday test (desktop) — pipeline dry-run: template copy → push → green preview in ~20s; budget is all writing time. Re-time with first real project.

## Session 3 — Graph + poster — done 2026-07-04
- [x] Graph compiler: collections → graph.json (hub node, tag/stack edges, baked force layout + camera pose, lowercase-slug normalization, single-use-tag warning) — deterministic (seeded), `scripts/build-graph.ts`, runs before astro build
- [x] Static SVG poster generator (orthographic projection, served as <img>) — `public/constellation.svg`, wired into hero
- [x] Verify: adding a project changes the graph with zero code edits (temp entry → graph.json + poster changed → removal reverts byte-identically)

## Session 4 — Hero (timeboxed) — done 2026-07-04
- [x] three.js + d3-force-3d island, client:visible (vanilla IntersectionObserver + dynamic import, no framework), initialized from baked positions
- [x] Inline head gate script + device matrix (doc 01 gates a–d) + layout reservation (static=1dvh-viewport, sim paths=200dvh; no-JS defaults to static)
- [x] Scroll dolly (native scroll; Lenis desktop-only), node click → case page
- [x] Cursor magnetism + node hover blooms (desktop, violet + tooltip)
- [x] Mobile "run the system" tap affordance (half budget, dolly disabled — animates in place)
- [x] Particle polish — laminar edge streams + ambient drift; STOPPED at timebox (LCP tuning is session 5)

## Session 5 — Verify + ship — done 2026-07-05 except phone test + real content
- [x] Lighthouse mobile (4x CPU throttle, slow-4G sim): auto path 0.99 / LCP 1.72s, reduced-motion path 1.0 / LCP 1.19s — LCP element is the poster <img> on both (CLS 0.001)
- [x] prefers-reduced-motion → static only (verified on production with --force-prefers-reduced-motion → data-hero="static", sim never hydrates)
- [x] Feed navigable with JS disabled (plain anchors in static HTML, re-verified with temp entries)
- [x] Poster→sim crossfade: no node jump (session-4 visual verification, projection contract in code)
- [ ] Live phone test: file create / folder trick / image upload per GitHub surface → THEN write README phone workflow (BLOCKED on user's phone)
- [x] /gstack-qa passes — health 97→100; fixed ISSUE-001 (tap button stayed visible, PR #8); deferred ISSUE-002 (THREE.Clock deprecation, low)
- [x] /gstack-design-review passes — B+→A−, AI-slop A; fixed FINDING-001/002/003 (touch targets, case-page site ID, duplicate CTA, PR #9)
- [x] Ship v1, share URL: https://portfolio-rho-wheat-94.vercel.app (content pending: 3 real projects)

## Deferred (from session-5 reviews)
- THREE.Clock → THREE.Timer in src/scripts/hero-sim.ts (deprecation warning, low; breaks on a future three.js major)

## Post-v1 (triggers, not plans)
- Agent-drafting workflow — trigger: finished project unwritten > 2 weeks
- Sveltia/Pages CMS panel — trigger: > 2 frontmatter-typo PR failures/month
- v2: semantic query layer + llms.txt, ElevenLabs narration, multi-scene camera
