# Help site — policy & regeneration notes

> **Owner's note (why this exists).** The Markdown files in `strata/docs/` are what **Claude** reads —
> they're the source of truth and are tuned for the model. But **learning from raw Markdown is harder for
> people**, so we also ship a **human-facing HTML help site** (tabaqat-branded) generated from those same
> Markdown files. Keep both in sync: **when the `.md` docs change, regenerate the HTML.** Markdown = for
> Claude; HTML = for humans.

## The two layers

| Layer | Path | Audience | Edit? |
|---|---|---|---|
| **Markdown docs** | `strata/docs/**/*.md` | **Claude** (source of truth) | ✅ edit these |
| **HTML help site** | `strata/docs/help/*.html` | **Humans** (branded, linked) | ❌ generated — never hand-edit |
| **Generator** | `strata/docs/help/build_site.py` | — | ✅ edit to add/remove topics or restyle |

## Regenerate the site (do this whenever the Markdown changes)

```bash
pip install --user markdown        # one-time (the only dependency)
python3 strata/docs/help/build_site.py
# → rewrites strata/docs/help/*.html + index.html
```

Open `strata/docs/help/index.html` in a browser. The generator renders each Markdown page into the
tabaqat theme (white background, navy `#0c2b38` + teal `#1ba7a6`, the layered "tabaqat · Strata" wordmark),
builds the sidebar navigation and the landing page, adds prev/next paging, and rewrites intra-doc links
(`.md` → the site's `.html`; links to other repo files stay relative).

## Adding or removing a topic

Edit the **`TOPICS`** list in `build_site.py` (`section`, `title`, `path-relative-to-docs`) and, optionally,
add a one-line blurb to `TAGLINE`. Content-only changes to existing pages need **no** code change — just
re-run. Maintainer docs (`docs/maintainers/`) are intentionally **excluded** — the site is user-facing.

## Rules
- **Never hand-edit `strata/docs/help/*.html`** — the next regeneration overwrites it. Edit the Markdown.
- After any `strata/docs/**/*.md` change, **re-run the generator** so the human site doesn't drift.
- Keep the ESRI Web Map JSON contract language and the Esri nominative disclaimer intact in the docs.
- This is also recorded as a convention in `.claude/CLAUDE.md` and `.github/CONTRIBUTING.md`.

## Sibling policy — reference docs

This page covers the Markdown→HTML **regen** half of doc sync. The other half — keeping the four **reference
docs** (`components.md`, `human-language.md`, `commands.md`, and the off-site `recipes/COMPONENT-MANIFEST.md`)
consistent with the **code** that is their source of truth — is governed by `strata/docs/REFERENCE-DOCS.md`
(the inventory spine, the code enums, the reconcile test, and the update matrix). The manifest is
intentionally **off** this site; that is exactly why it relies on the reconcile test instead of regen.
