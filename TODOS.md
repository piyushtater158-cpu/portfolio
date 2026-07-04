# Build checklist — Living System portfolio

Order is contractual (content system before spectacle). Full specs: docs/design/01 + 02, CLAUDE.md, DESIGN.md.

## Session 1 — Foundation ✅ (2026-07-04)
- [x] `bun create astro` scaffold (around existing CLAUDE.md/DESIGN.md/docs — do not overwrite)
- [x] `.gitignore` (.env, node_modules, dist, .astro) in first commit
- [x] Create PUBLIC GitHub repo, push, enable branch protection on main (require PR + Vercel check)
- [x] Connect Vercel, deployed placeholder live
- [x] Design tokens from DESIGN.md as CSS custom properties + fonts wired

## Session 2 — Content system (the product)
- [ ] Content collection + Zod schema (exact fields per doc 01)
- [ ] `src/content/projects/_template/` (excluded from collection glob)
- [ ] Case-study page template (dark, mobile-first, lite-embed YouTube, status treatments, CTA block)
- [ ] Project feed (reverse-chron, all statuses, no-JS navigable)
- [ ] Footer contact CTA on every page
- [ ] Enter 3 real projects (BLOCKED on user content — never fabricate)
- [ ] Verify: malformed frontmatter fails PR build with readable error
- [ ] Verify: 15-minute Tuesday test (desktop) passes

## Session 3 — Graph + poster
- [ ] Graph compiler: collections → graph.json (hub node, tag/stack edges, baked force layout + camera pose, lowercase-slug normalization, single-use-tag warning)
- [ ] Static SVG poster generator (orthographic projection, served as <img>)
- [ ] Verify: adding a project changes the graph with zero code edits

## Session 4 — Hero (timeboxed)
- [ ] three.js + d3-force-3d island, client:visible, initialized from baked positions
- [ ] Inline head gate script + device matrix (doc 01 gates a–d) + layout reservation
- [ ] Scroll dolly (native scroll; Lenis desktop-only), node click → case page
- [ ] Cursor magnetism + node hover blooms (desktop)
- [ ] Mobile "run the system" tap affordance (half budget)
- [ ] Particle polish — HARD TIMEBOX: one session

## Session 5 — Verify + ship
- [ ] Lighthouse mobile (4x CPU throttle, Fast 3G): LCP < 2.5s both paths
- [ ] prefers-reduced-motion → static only (emulated)
- [ ] Feed navigable with JS disabled
- [ ] Poster→sim crossfade: no node jump (Success Criterion 8)
- [ ] Live phone test: file create / folder trick / image upload per GitHub surface → THEN write README phone workflow
- [ ] /gstack-qa + /gstack-design-review passes
- [ ] Ship v1, share URL

## Post-v1 (triggers, not plans)
- Agent-drafting workflow — trigger: finished project unwritten > 2 weeks
- Sveltia/Pages CMS panel — trigger: > 2 frontmatter-typo PR failures/month
- v2: semantic query layer + llms.txt, ElevenLabs narration, multi-scene camera
