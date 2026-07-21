# strata-app-builder help site (generated)

This folder is the **human-facing HTML help site**, generated from the Markdown in `strata/docs/` by
`build_site.py`. **Do not hand-edit the `*.html` files** — they are regenerated.

- **Open it:** `index.html`
- **Regenerate** (after editing any `strata/docs/**/*.md`):
  ```bash
  pip install --user markdown
  python3 strata/docs/help/build_site.py
  ```
- **Add/remove a topic:** edit the `TOPICS` list in `build_site.py`.

Full policy: [`../HELP-SITE.md`](../HELP-SITE.md). (Markdown = for Claude; HTML = for humans — keep them in sync.)
