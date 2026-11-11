# How to Update Your Portfolio Projects (No Coding Required)

This guide is for you. You do **not** need AI agents, a code editor, or a terminal. Your portfolio’s “admin panel” is **GitHub in the browser**.

Keep this file on your computer (OneDrive). It is personal notes — not part of the public website.

---

## Bookmarks (save these)

| What | Link |
|------|------|
| **Live site** | https://piyushtater.com |
| **GitHub repo (admin panel)** | https://github.com/piyushtater158-cpu/portfolio |
| **Browser editor (easiest on laptop)** | https://github.dev/piyushtater158-cpu/portfolio |
| **Projects folder** | `src/content/projects/` |
| **Template to copy** | `src/content/projects/_template/index.mdx` |

---

## How it works (30 seconds)

1. You edit project files on GitHub (in a **new branch**).
2. You open a **Pull Request** (PR).
3. Vercel builds a **preview link** so you can check the site before it goes live.
4. When the preview looks good, you **merge** the PR.
5. The live site updates in about 1–2 minutes.

**One project** = one folder + one file:

```
src/content/projects/<your-slug>/index.mdx
```

- The folder name (`your-slug`) becomes the URL: `piyushtater.com/projects/your-slug`
- Images go in: `src/content/projects/<your-slug>/assets/`
- **Never edit `main` directly.** Always use branch → PR → merge.

---

## Required fields (must fill these in)

These six fields are required. If any are wrong or missing, the preview build will fail (red X on the PR) — that protects the live site.

| Field | What to write | Example |
|-------|---------------|---------|
| `title` | Project name, one line | `Invoice Automation Bot` |
| `status` | Exactly one word: `live`, `dead`, or `paused` | `live` |
| `date` | `YYYY-MM-DD` (newest projects show first) | `2026-07-01` |
| `tags` | Topics in square brackets, lowercase | `[automation, finance]` |
| `stack` | Tech you used | `[python, n8n]` |
| `outcome` | One sentence — the result (use a number if you have one) | `Cut processing time from 4 hours to 20 minutes.` |

**Optional** (delete any line you don’t need):

- `org_context` — who the client was (one line)
- `links` — YouTube, LinkedIn, live demo, GitHub repo, X, or other links
- `cover_logo` — small logo on the graph node card (`./assets/logo.png`)
- `hero_asset` — thumbnail in the WORK list (`./assets/hero.png`)
- **Gated / test-only apps** — use `status: paused`, add **Request beta access** under `links.other`, and include the standard apply block in the case study (copy from `_template/index.mdx` on GitHub). See **Test / beta access** below.
- Everything **below** the second `---` line is your case study story (plain writing is fine)

---

## Add a new project (laptop — recommended)

Use **github.dev** — it works like a simple text editor in your browser.

### Step 1 — Open the editor

Go to: https://github.dev/piyushtater158-cpu/portfolio

Sign in to GitHub if asked.

### Step 2 — Create a new branch

1. Look at the bottom-left corner for the branch name (it probably says `main`).
2. Click it → **Create new branch**.
3. Name it something clear, e.g. `add-project-invoice-bot`.
4. Press Enter.

You are now working on a copy. The live site is unchanged until you merge.

### Step 3 — Create your project folder and file

1. In the left file tree, open `src` → `content` → `projects`.
2. Right-click `projects` → **New Folder** → type your slug (lowercase, hyphens, no spaces), e.g. `invoice-bot`.
3. Right-click your new folder → **New File** → name it `index.mdx`.

### Step 4 — Copy the template

1. Open `src/content/projects/_template/index.mdx`.
2. Select all (Ctrl+A) and copy (Ctrl+C).
3. Open your new `index.mdx` and paste (Ctrl+V).

### Step 5 — Fill in your details

Replace the placeholder text at the top. Example you can adapt:

```yaml
---
title: Invoice Automation Bot
status: live
date: 2026-07-01
tags: [automation, finance]
stack: [python, n8n]
outcome: Cut invoice processing from 4 hours to 20 minutes for a 12-person finance team.
links:
  youtube: "https://youtu.be/your-video-id"
  linkedin: "https://www.linkedin.com/posts/your-post"
  live: "https://your-demo-url.com"
  repo: "https://github.com/your-org/your-repo"
cover_logo: ./assets/logo.png
---

## What I built

Write your case study here in plain language. Short paragraphs work well.

## What changed

- Before: manual spreadsheets, 4 hours per batch
- After: automated pipeline, 20 minutes per batch
```

**Rules for the top section (between the `---` lines):**

- Keep the `---` lines — they are required.
- `status` must be exactly `live`, `dead`, or `paused` (not “Live” or “LIVE”).
- `date` must look like `2026-07-01`.
- URLs must start with `https://` (include the full link).
- If you reference an image like `./assets/logo.png`, upload that file (next step).

### Step 6 — Add images (optional)

1. Right-click your project folder → **New Folder** → `assets`.
2. Drag image files into `assets`, or right-click `assets` → **Upload**.
3. Only reference images that actually exist in that folder.

### Step 7 — Save (commit) your branch

1. Click the **Source Control** icon on the left (branch symbol), or Ctrl+Shift+G.
2. You should see your new/changed files listed.
3. Type a short message, e.g. `Add invoice bot project`.
4. Click **Commit**.
5. Click **Publish Branch** or **Sync** if prompted.

### Step 8 — Open a Pull Request

1. Go to https://github.com/piyushtater158-cpu/portfolio
2. You should see a yellow bar: **Compare & pull request** — click it.  
   (If not: **Pull requests** → **New pull request** → choose your branch.)
3. Give the PR a title, e.g. `Add invoice bot project`.
4. Click **Create pull request**.

### Step 9 — Check the preview

1. Wait 1–2 minutes. A bot will comment with a **Vercel preview URL**.
2. Open that preview link — it is your site with your changes, not yet live.
3. Check:
   - Your project appears in the **01 WORK** section.
   - Clicking the project row opens the **card popup**.
   - Your project name appears on the **graph** (after the animation loads).
   - The full case study page works: `preview-url/projects/invoice-bot`

### Step 10 — Go live

1. If the preview looks good and checks are green, click **Merge pull request**.
2. Wait 1–2 minutes, then open https://piyushtater.com and hard-refresh: **Ctrl+Shift+R**.

**Done.** Your project is live.

---

## Edit an existing project

Same flow, shorter path:

1. Open https://github.dev/piyushtater158-cpu/portfolio
2. Create a new branch (e.g. `edit-invoice-bot-outcome`)
3. Open `src/content/projects/<slug>/index.mdx`
4. Make your changes
5. Commit → open PR → check preview → merge

You can edit text, links, images, or `status` (e.g. change `live` to `paused`).

---

## On your phone

- **GitHub mobile app** is good for: reading files, small text edits, reviewing PRs, merging when preview looks good.
- **Creating a brand-new project** (new folder + file + images) is much easier on a laptop with github.dev.
- For your first project, use the laptop steps above.

---

## What you should see on the live site

| You published… | You should see… |
|----------------|-----------------|
| **No projects yet** | WORK says *“case studies compiling…”* — only the center hub on the graph, no project cards |
| **One or more projects** | Project rows in WORK; names on graph nodes; clicking opens the card popup |

The center **PIYUSH TATER** hub does not open a card — only **project** nodes and WORK rows do.

The `_template` folder never appears on the site. It is only a starting copy.

---

## Troubleshooting

### PR has a red X (build failed)

1. On the PR, click **Details** next to the failed Vercel check.
2. Read the error — common fixes:

| Error hint | Fix |
|------------|-----|
| `title is required` | Add a `title:` line |
| `status must be exactly one of` | Use only `live`, `dead`, or `paused` |
| `date must be a real date` | Use `YYYY-MM-DD` format |
| `tags needs at least one` | Add `tags: [something]` |
| `must be a full URL` | Links need `https://` at the start |
| Image error | Make sure the image file exists in `assets/` |

3. Fix on your branch in github.dev, commit again — the PR rebuilds automatically.

### Preview looks right but live site doesn’t

- Wait 2 minutes after merging.
- Hard refresh: **Ctrl+Shift+R** (or clear browser cache).
- Confirm you merged the PR (not just saved the branch).

### I click WORK but no card appears

- Click a **project row** (title + description), not the `01 WORK` heading.
- If you see *“case studies compiling…”*, no projects are published yet — complete the add flow above.

### Graph doesn’t pulse or has no labels

- The graph needs at least one **published project** for names and clickable nodes.
- With only the hub, the animation is subtle.
- If you use “reduce motion” in Windows/macOS settings, the site shows a static poster instead of the animated graph (by design).

---

## Do / Don’t

**Do:**

- Always use a branch and Pull Request.
- Reuse the same **tags** across projects when they share a topic (helps the graph connect them).
- Use lowercase hyphenated folder names: `my-project-name`.
- Use full URLs: `https://...`

**Don’t:**

- Edit `main` directly (branch protection blocks this anyway).
- Commit password files or `.env` files.
- Use spaces in folder names.
- Reference images you haven’t uploaded.

---

## Quick checklist (new project)

- [ ] New branch created
- [ ] Folder `src/content/projects/<slug>/` created
- [ ] `index.mdx` filled from template
- [ ] All six required fields filled correctly
- [ ] Images uploaded to `assets/` if referenced
- [ ] **If test/beta-only:** `status: paused`, Request beta access link, Apply section in case study (see below)
- [ ] Committed and PR opened
- [ ] Preview URL checked — WORK, graph, and card all look right
- [ ] PR merged
- [ ] Live site checked at https://piyushtater.com

---

## Test / beta access (standard for gated products)

**Use this pattern for every project that is not open to the public** — not only Ledger Lens. Applications happen on the **portfolio case study page**, not inside the app.

### What to add (copy from template)

1. **Frontmatter:** `status: paused` (shows **ON ICE** on the card).
2. **`links.other`:** one row with label **Request beta access** — start with the prefilled `mailto:` in `_template/index.mdx`; upgrade to a Google Form URL when ready.
3. **Case study body:** callout + **Apply for test access** section (uncomment or copy the block in `_template/index.mdx`).

### How applicants apply

1. They click **Request beta access** on the graph node card or case study page.
2. They submit via email (mailto) or your Google Form.

### How you review

1. Read submissions in your inbox or linked Google Sheet.
2. Add a tracker column: Pending / Approved / Declined / Invited.
3. If approved, email them at their **sign-in account email** with the live URL for that product.

### Upgrade to Google Form (recommended)

One form per gated product. Step-by-step: **`BETA-ACCESS-FORM-SETUP.md`** in this folder (same fields for every project: name, sign-in email, about, organization, role, optional why).

**Example (Ledger Lens):** live at https://ledgerlens.piyushtater.com — portfolio file `ledger-lens/index.mdx`.

---

*Last updated: July 2026. For the live template with latest fields, always copy from `src/content/projects/_template/index.mdx` on GitHub.*
