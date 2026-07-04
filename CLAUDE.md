# Portfolio — Living System (build contract)

Piyush Tater's portfolio: a GenAI systems developer whose site behaves like a GenAI system. The homepage is a particle node-graph that functions like an AI pipeline; each project is a node. Dark terminal aesthetic, scroll-driven camera, case-study rigor.

**Source of truth:** `docs/design/01-living-system-architecture.md` (site architecture, APPROVED) and `docs/design/02-update-surface-github-as-panel.md` (content workflow, APPROVED). When this file and those docs conflict, the design docs win. Read `DESIGN.md` before any visual work — aesthetic quality is the top-priority requirement of this project.

## Hard rules

1. **bun only.** No npm/yarn/pnpm anywhere — scripts, docs, CI.
2. **Never push to main.** Every change (code AND content) goes branch → PR → Vercel preview → merge. Set up branch protection on `main` (require PR + passing Vercel check) at repo creation. Repo is PUBLIC (branch protection with required checks is free only on public repos — a deliberate design decision).
3. **Projects are files, never database rows.** `src/content/projects/<slug>/index.mdx` with Zod-validated frontmatter. No CMS, no admin app, no database — GitHub itself is the admin panel (see doc 02). Do not propose or add a CMS; upgrade triggers are written in doc 02 and fire on data, not vibes.
4. **The 15-minute Tuesday test is the primary success metric.** Adding project #4 (folder + frontmatter + assets + push + live) must take under 15 minutes and touch nothing outside `src/content/projects/`. Any change that breaks this fails review.
5. **The poster is always the first paint.** The static SVG constellation (`<img>`, a valid LCP element) renders before the WebGL sim on every device. Device gates, particle budgets, and layout reservation rules are specified in doc 01 — implement them exactly.
6. **This folder stays out of OneDrive.** The repo lives at `C:\dev\portfolio`. Media/doc archives may live in the OneDrive folder (`...\Claude\Projects\Portfolio`), never `node_modules`, `.git`, or build output.
7. **No secrets in the repo.** `.env` is gitignored from the first commit.

## Architecture spine (summary — full spec in doc 01)

- **Stack:** Astro 5 + TypeScript + bun, deployed on Vercel (PR previews). Static-first, islands architecture.
- **Content schema:** required `title, status: live|dead|paused, date, tags[], stack[], outcome`; optional `org_context, links{youtube,linkedin,live,repo}, hero_asset`. Assets co-located in the project's `assets/` folder. Tags/stack normalized to lowercase slugs at compile time; build warns on single-use tags.
- **Graph compiler:** build step emits `graph.json` — nodes = projects + one hub node ("PIYUSH / SYSTEMS"), edges = shared tags+stack (weight = overlap), force layout baked ONCE at build with settled x/y/z + camera pose. SVG poster and runtime sim both consume the same baked positions (orthographic projection contract in doc 01).
- **Hero:** three.js points + d3-force-3d in ONE `client:visible` island. v1 camera = one scroll-driven dolly (native scroll position; Lenis desktop-only; NO scroll hijack on mobile). Particle budget: start 6,000 desktop / 3,000 mobile tap-to-run; tune against LCP.
- **Device gates:** inline head script before first paint. No WebGL or `prefers-reduced-motion` → static only. Viewport <768px or `deviceMemory`<4 → poster + "run the system" tap affordance. Otherwise sim auto-hydrates after first paint. Layout reservation rules per doc 01 (CLS-safe).
- **Status treatments:** dead → desaturated/red-shifted node + POST-MORTEM banner; paused → dimmed + "on ice" badge; live → full.
- **Feed:** reverse-chronological, ALL projects (statuses interleaved with badges), every project reachable without the canvas, works with JS disabled.
- **Contact:** persistent footer (mailto + LinkedIn + "Work with me"); CTA block ends every case page.

## Build order (do not reorder — content system before spectacle)

1. Scaffold Astro + bun here; first commit includes `.gitignore` (.env, node_modules, dist, .astro). Push to new PUBLIC GitHub repo; enable branch protection; connect Vercel. Deployed placeholder before any feature work. (Note: this folder already contains CLAUDE.md/DESIGN.md/docs/TODOS.md — scaffold around them, don't overwrite.)
2. Content collection schema + Zod validation + `src/content/projects/_template/` (excluded from collection glob) + case-study page template.
3. Enter the 3 real projects (waits on the user's content — do not fabricate projects; placeholder entries only on a branch, never merged).
4. Graph compiler → `graph.json` (with baked layout + camera pose) + static SVG poster generator.
5. Hero island (three.js + d3-force-3d + device gates + tap-to-run) — particle polish is TIMEBOXED to one session.
6. Performance pass: Lighthouse mobile, Chrome DevTools 4x CPU throttle + Fast 3G; cut particles until budgets pass.
7. README phone-workflow section — written only AFTER the live phone test (doc 02, Next Step 2).

## Success criteria (verify before calling any phase done)

Doc 01 lists 9, doc 02 lists 5. The non-negotiables: 15-minute Tuesday test; LCP < 2.5s both paths (poster is LCP element); no layout jump at poster→sim crossfade; reduced-motion gets static; feed navigable with JS disabled; malformed frontmatter fails the PR build, never production; branch protection enforced including on the owner.

## Working conventions

- Session flow: Think → Plan → Build → Review → Test → Ship (gstack). Verify with real browser checks (`/gstack-qa`, `/gstack-design-review`) — screenshots over assumptions, especially for the hero.
- The aesthetic bar is DESIGN.md. Every visual decision is tested against the pipeline metaphor question: "does this make the pipeline metaphor more true?" — not "is this prettier?"
- v2 backlog (do NOT build in v1): semantic query layer + llms.txt, ElevenLabs narration, multi-scene camera choreography, CMS panel / agent-drafting workflow (triggers in doc 02).

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /gstack-office-hours
- Strategy/scope → invoke /gstack-plan-ceo-review
- Architecture → invoke /gstack-plan-eng-review
- Design system/plan review → invoke /gstack-design-consultation or /gstack-plan-design-review
- Bugs/errors → invoke /gstack-investigate
- QA/testing site behavior → invoke /gstack-qa or /gstack-qa-only
- Code review/diff check → invoke /gstack-review
- Visual polish → invoke /gstack-design-review
- Ship/deploy/PR → invoke /gstack-ship or /gstack-land-and-deploy
- Save progress → invoke /gstack-context-save
- Resume context → invoke /gstack-context-restore
