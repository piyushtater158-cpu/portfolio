# Session log — append-only

One entry per working session, newest last. Format: date, what changed, decisions, surprises. Keep entries to 3–6 lines; STATE.md holds the current view, this file holds the trail.

## 2026-07-04 — Design (office hours ×2, OneDrive folder)
Living System design approved (particle node-graph pipeline, Astro, files-as-CMS) after 3 adversarial review rounds, 29 fixes. Update-surface design approved: GitHub-as-panel, zero new infrastructure, upgrade triggers written. User overrode CMS+agent recommendation for the leaner option. Veo 3.1 concept clips generated in Google Flow; assembled master_16x9 (28.2s) + vertical_9x16 (13.2s) cuts in OneDrive `Video references/edit/`.

## 2026-07-04 — Build sessions 1–4 (this repo)
Scaffolded Astro 7 + bun (PRs #1–#3), content system + schema + feed + case pages (#4), malformed-frontmatter build check verified (#5), graph compiler + constellation poster (#6), hero island with gates/dolly/magnetism/blooms/tap-to-run (#7). Wordmark set to PIYUSH TATER (#3). Pipeline dry-run: template → push → green preview ~20s.

## 2026-07-05 — Session 5: verify + ship
QA 97→100 (fixed tap-button visibility, #8); design review B+→A− (touch targets, case-page site ID, duplicate CTA, #9); Lighthouse mobile 0.99/1.0, LCP 1.72s/1.19s, CLS 0.001; reduced-motion + no-JS paths verified on production. Shipped v1: https://portfolio-rho-wheat-94.vercel.app (#10). Deferred: THREE.Clock deprecation. Blocked on user: 3 real projects, phone test, LinkedIn URL.

## 2026-07-05 — Context system created (this session)
Created `context/` (STATE.md + LOG.md) and wired the session protocol into CLAUDE.md so every new session auto-loads the current state and must update it before ending.

## 2026-07-08 — Node card + pulsing graph + card data pipeline (feat/node-card-pipeline)
User requested (pre-content) the project-card pipeline: HUD-layout popup (logo top-left, info rows top-right, platform links bottom-left, YouTube auto-thumbnail → new tab, case-study CTA) opening on graph-node click and feed click (progressive enhancement), plus continuous heartbeat pulsing on all nodes. Schema +`cover_logo`/`links.x`/`links.other`; graph compiler bakes a `card` payload per node and copies logos to generated `public/graph-cards/`; shared `src/lib/youtube.ts` parser. Bug caught in verification: author `display:grid` beat the UA `[hidden]` rule, so the closed card layer blocked all page clicks — fixed with an explicit `[hidden]{display:none}`. Verified with throwaway content (deleted before PR): desktop node click, feed click, Escape/backdrop/focus restore, no-video collapse, 390px bottom sheet. Gotcha: deleting a content folder mid-dev-daemon leaves a stale content-layer cache — clear `node_modules/.astro` + `.astro`.

## 2026-07-11 — Mascot chatbot widget (feat/mascot-chat)
User supplied a robot mascot image (Downloads JPEG) + his n8n Chat Trigger webhook; asked for a fixed bottom-left mascot that waves and opens a compact chat window. Built `src/scripts/mascot-chat.ts` (node-card conventions: singleton factory, injected CSS, esc(), 44px targets), circular avatar `public/mascot.webp` (sharp crop of the JPEG head, 6.9KB — source image stays out of the repo), webhook URL in `src/config.ts`, lazy post-load mount in `Base.astro`. Webhook streams NDJSON (begin/item/end) — client renders chunks progressively; verified parser against the live endpoint. Verified in browser: idle bob + wave, panel open/Escape/focus, history persists across pages (sessionStorage), 390px bottom sheet. **Surprise/blocker: the Chat Trigger's Allowed Origins is locked to `https://pustarter.com`** — browser calls from localhost/vercel.app are CORS-blocked until the user widens it in n8n.

## 2026-07-11 — Mascot chat shipped to production (#16)
Finished and merged the mascot chatbot. Added `api/chat.ts` (Vercel Edge proxy to the n8n webhook — bypasses CORS without n8n config changes), upgraded to full-body robot assets (`mascot-full.webp`, `mascot-hand.webp`) with separate hand wave animation, bottom-right placement. Fixed Edge runtime config after initial 500 (`FUNCTION_INVOCATION_FAILED`). Preview + production verified: `/api/chat` 200 with streaming NDJSON, mascot visible on home + case pages, end-to-end chat reply on https://portfolio-rho-wheat-94.vercel.app. `/api/chat` not served by `astro dev` — use preview deploy or `vercel dev`.
