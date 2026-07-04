# DESIGN.md — Living System design source of truth

Aesthetic quality is this project's top-priority requirement. Every visual decision passes one test before "is it pretty": **does this make the pipeline metaphor more true?** The site is an argument — "I build living AI systems" — not a gallery.

## Palette

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0A0A0F` | Page background. Near-black obsidian, never pure #000 |
| `--bg-raised` | `#101018` | Panels, case-study surfaces |
| `--accent` | `#22D3EE` | Electric cyan — particles, edges, links, focus rings |
| `--accent-2` | `#8B5CF6` | Deep violet — node blooms, hover states, ambient bleed |
| `--text` | `#F4F4F5` | Primary text |
| `--text-dim` | `#9CA3AF` | Secondary text, metadata |
| `--hairline` | `#27272A` | 1px borders. Borders are hairlines or nothing |
| `--dead` | `#F87171` (desaturated red-shift) | Dead-project node tint + POST-MORTEM banner |
| `--paused` | 40% opacity of node color | "On ice" treatment |

Rules: max two accent colors on screen at once. Cyan is structural (data/motion), violet is reactive (response to the visitor). No gradients as decoration — glow and light bleed only where the simulation justifies them. Subtle film grain on the hero is welcome; lens flares are banned.

## Typography

- **Display / terminal accent:** JetBrains Mono (or Geist Mono). Wordmark, node labels, section markers (`01`, `02`), frontmatter-style metadata. Uppercase sparingly.
- **Body:** Inter (or Geist Sans). Case-study prose is set for READING: 16–18px, line-height 1.6–1.7, measure 60–75ch, `--text` on `--bg-raised`.
- Monospace is seasoning, not the meal — body text is never monospace.
- Type scale: 1.25 ratio. H1 clamps between 2.5rem and 4.5rem with viewport.
- The wordmark types on with a blinking block cursor (matches the concept video).

## Motion language

The one-word brief: **inertia**. Nothing snaps; everything glides and settles like it has mass.

- Easing: `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out-quint feel) for entrances; ease-in-out-cubic for continuous motion. NEVER linear.
- Durations: micro-interactions 150–250ms; reveals 400–600ms; camera/scroll responses continuous, no keyframed jumps.
- Particles move in laminar streams along fixed curved paths — data packets in a pipeline, never fireworks.
- Cursor magnetism (desktop): nearby particles bend gently toward the pointer, swirl in its wake. Radius small enough to feel discovered, not demonstrated.
- Scroll: Lenis smoothing desktop-only. Mobile keeps native scroll — no hijacking, ever.
- Staggered reveals in the feed: 40–60ms stagger, translate-y 8–12px + fade, once per element (no re-trigger on scroll-up).
- `prefers-reduced-motion`: static poster, no sim, no staggered reveals, instant states. This is a functional requirement, not polish.

## The "elevated automatically" principle (progressive delight)

The experience upgrades itself to whatever the visitor's device and preferences allow — the visitor never configures anything:

1. **Everyone, instantly:** the static constellation poster (same real graph data), crisp type, readable feed. This baseline must already look excellent — it IS the site for a large share of visitors.
2. **Capable devices, after first paint:** the sim fades in over the poster (baked positions — zero jump), particles begin to flow, the graph breathes.
3. **Desktop pointers:** cursor magnetism, node hover blooms (violet), smooth-scroll inertia.
4. **Mobile:** a quiet "run the system ▸" affordance turns spectacle into a chosen interaction at half particle budget.

Each tier is complete in itself. Delight is added, never required.

## Component rules

- Cardless by default: hierarchy through space, hairlines, and type — not boxes. When a surface is needed (case panels), `--bg-raised` + 1px hairline, radius 6–8px max.
- Empty/edge states are designed, not defaulted: zero-asset project cards get a generated status-color tile; long titles (47+ chars) wrap without breaking layout; a feed of 3 must look intentional, not sparse.
- Status badges: small monospace uppercase chips — `LIVE` (cyan outline), `POST-MORTEM` (dead-red outline), `ON ICE` (dim).
- YouTube embeds: lite-embed facade (thumbnail + play), never an eager iframe. LinkedIn: screenshot + link, styled to the palette.
- Focus states: visible cyan focus ring on every interactive element. Keyboard navigation works everywhere the mouse does.
- Contrast: all text meets WCAG AA against its background (`--text-dim` on `--bg` passes; verify anything new).

## Anti-slop list (instant review failures)

Generic SaaS gradients/purple-blue hero blobs · stock hologram/HUD clichés · lens flares · emoji as UI · boxed card grids with drop shadows · centered-everything layouts · linear easing · motion that blocks reading · light mode (v1 is dark-only, by design) · any element that exists because portfolios usually have it rather than because the pipeline metaphor needs it.

## Reference cluster (the taste this site descends from)

StringTune / Smoothy (scroll-driven inertia) · AI particle simulators (generative WebGL) · 21st.dev / Variant (dark, engineering-crisp restraint) · motionsites.ai (motion as identity). The concept videos in the OneDrive folder (`Video references/`) are the approved mood target — palette and motion of the site should feel continuous with them.
