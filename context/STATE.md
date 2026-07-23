# PROJECT STATE — single source of current truth

> Read this file at the START of every session. Update it at the END of any session that changed code, content, decisions, or deployment. Append one entry to `context/LOG.md` per session. Rules for maintaining this file are in CLAUDE.md → "Session protocol".

Last updated: 2026-07-23 (card polish: CTA glow, beta-access modal, stack icon chips — feat/card-polish)

## Where the project stands

**v1 is LIVE:** https://portfolio-rho-wheat-94.vercel.app
Repo: https://github.com/piyushtater158-cpu/portfolio (public, branch protection on `main`, PR + Vercel check required)
Stack: Astro 7 + bun + TypeScript, three.js/d3-force-3d hero island, Vercel deploys.

All five build sessions in TODOS.md are complete. QA health 100 (was 97), design review A− (was B+). Lighthouse mobile: 0.99 auto path / LCP 1.72s; reduced-motion path 1.0 / LCP 1.19s; CLS 0.001; poster `<img>` is the LCP element on both paths — every performance contract from the design docs is met.

Since then: node-card pipeline merged (#12); first real project **Ledger Lens** live with beta-access application flow (#13, #14); beta-access norm documented (`chore/beta-access-norm`); **mascot chatbot shipped (#16)** — full-body robot avatar bottom-right on every page, compact chat panel wired through `api/chat.ts` (Vercel Edge proxy → n8n Chat Trigger webhook), streaming NDJSON, sessionStorage history, lazy-mounted post-load from `Base.astro`. Verified on production: mascot visible on home + case pages, `/api/chat` 200, end-to-end chat reply in browser. No n8n CORS changes needed — browser never calls the webhook directly.

Card polish (2026-07-23, feat/card-polish): node-card "open case study →" CTA now pulses cyan (2.4s, out of phase with the card breathe; static glow under reduced motion). "Request beta access" links (label-keyed norm, `src/lib/beta-access.ts`) open an instructions modal (`src/scripts/beta-access-modal.ts`, singleton stacking above the node card at z-30; mailto href untouched = no-JS fallback) listing what applicants must email. Stack renders as brand-colored icon chips (`src/lib/stack-icons.ts`, simple-icons CC0 paths, unknown slugs → text chips; user explicitly overrode DESIGN.md's monochrome rule for these). build-graph now imports slugify from stack-icons (byte-identical graph.json verified). Beta-access norm docs (branch `chore/beta-access-norm`) folded in.

## Blocked on the user (nothing else blocks launch-completeness)

1. **3 real projects** — `src/content/projects/` contains only `_template/` plus Ledger Lens. No content is fabricated, per contract. Needed per project: title, status, date, tags, stack, one-sentence outcome, links (YouTube/LinkedIn/live/repo), optional images.
2. **Live phone test** — verify file create / folder trick / image upload per GitHub mobile surface, THEN write the README phone-workflow section (docs/design/02, Next Step 2). A failed test is an immediate trigger for the upgrade path.
3. **LinkedIn URL** — set in `src/config.ts` (footer CTA); currently populated.
4. **Custom domain** — still an open question from the design docs; site runs on the vercel.app URL.

## Deferred (known, deliberate)

- `THREE.Clock` → `THREE.Timer` in `src/scripts/hero-sim.ts` (deprecation, low; breaks on a future three.js major).
- ISSUE-002 from QA (same THREE.Clock item).
- Post-v1 triggers (do NOT build until a trigger fires — docs/design/02): agent-drafting workflow (project unwritten >2 weeks); Sveltia/Pages CMS (>2 frontmatter-typo PR failures/month). v2 backlog: semantic query layer + llms.txt, ElevenLabs narration, multi-scene camera.

## Key map

| What | Where |
|---|---|
| Build contract + hard rules | `CLAUDE.md` |
| Design system (aesthetic source of truth) | `DESIGN.md` |
| Approved architecture design doc | `docs/design/01-living-system-architecture.md` |
| Approved update-workflow design doc | `docs/design/02-update-surface-github-as-panel.md` |
| Build checklist w/ per-session status | `TODOS.md` |
| Graph compiler (runs before astro build) | `scripts/build-graph.ts` |
| Hero sim | `src/scripts/hero-sim.ts` |
| Content schema + entries | `src/content/projects/` |
| Poster | `public/constellation.svg` (generated) |
| Session history | `context/LOG.md` |

## Decision provenance (why things are the way they are)

- Living System direction, proof-of-pipeline scope, files-not-database, poster-first paint, device gates, public repo: all decided in the two approved design docs (session records inside them). The user deliberately rejected a CMS/admin panel (chose GitHub-as-panel) and overrode a B+C recommendation to do it — do not re-propose a CMS; the upgrade triggers are data-driven and written down.
- Concept videos (Veo 3.1, moodboard + LinkedIn teaser, NOT a site asset): OneDrive `...\Claude\Projects\Portfolio\Video references\edit\` (master_16x9.mp4, vertical_9x16.mp4).
- OpenRouter + ElevenLabs keys: OneDrive `...\Claude\Projects\Portfolio\.env.txt` (rename to `.env` if ever moved; never commit).

## Next actions (in order)

1. User writes raw material for project #1 (links + 5 outcome bullets) → agent drafts frontmatter+MDX on a branch → preview → merge. Repeat ×3. Re-time the 15-minute Tuesday test with the first real one.
2. User runs the phone test → write README phone workflow from what actually worked.
3. Set LinkedIn URL in `src/config.ts`.
4. Decide domain; attach in Vercel.
5. Post the vertical concept video + live URL on LinkedIn (launch moment).
