# Beta / test access — Google Form setup (any gated project)

Use this for **every project that is test-users-only** (not just Ledger Lens). Create one form per product, then paste the public URL into that project's `index.mdx` under `links.other` (replace the `mailto:` link).

**Portfolio norm:** `status: paused`, **Request beta access** on the node card, **Apply for test access** section on the case study. See `HOW-TO-UPDATE-PROJECTS.md` and `_template/index.mdx` on GitHub.

## 1. Create the form

1. Go to https://forms.google.com
2. Click **Blank form**
3. Title: **{Project Name} — Test Access Request** (e.g. `Ledger Lens — Test Access Request`)
4. Description: *{Project name} is in private beta. Approved testers sign in at {your-live-url}.*

## 2. Add these questions (all required except the last)

| # | Question type | Question text | Notes |
|---|---------------|---------------|-------|
| 1 | Short answer | Full name | Required |
| 2 | Short answer | Google account email (used to sign in) | Required — description: "The Gmail/Google address you will use to sign in" |
| 3 | Paragraph | About you | Required — "A few sentences about your background" |
| 4 | Short answer | Organization | Required |
| 5 | Short answer | Role in organization | Required |
| 6 | Paragraph | Why you need access (optional) | Optional — invoice workflow, volume, etc. |

## 3. Form settings (gear icon)

- **Responses** tab → turn on **Collect email addresses**
- **Responses** tab → **Link to Sheets** → Create spreadsheet (your applicant tracker)
- **General** tab → check **Get email notifications for new responses**

## 4. Get the share link

1. Click **Send** (top right)
2. Link icon → copy URL (looks like `https://docs.google.com/forms/d/e/.../viewform`)
3. Shorten is optional; use the full URL

## 5. Update the portfolio

In `src/content/projects/<your-slug>/index.mdx`, replace the beta `mailto:` link with your Form URL:

```yaml
links:
  other:
    - label: Request beta access
      url: "https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform"
```

Also update the **Apply for test access** section in the MDX body to use the same Form URL instead of the mailto link.

Branch → PR → merge (see HOW-TO-UPDATE-PROJECTS.md).

## 6. Review workflow

1. You get an email for each submission
2. Row appears in the linked Google Sheet
3. Add columns: `Status` (Pending / Approved / Declined / Invited)
4. If approved: email them at their **sign-in account email**:  
   *You're approved for {Project Name} beta — sign in at {your-live-url}*

---

*Until this form exists, the portfolio uses a prefilled email link as a fallback.*
