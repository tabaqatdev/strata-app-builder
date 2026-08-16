#!/usr/bin/env python3
"""Build DESIGN-CONTEXT.md — the knowledge pack handed to Claude when asking for a bespoke application
design from a business brief or a RECIPE.md.

Run from anywhere:  python recipes/build_design_context.py

The output is GENERATED — never edit DESIGN-CONTEXT.md by hand. Regenerate whenever any source below
changes, otherwise the pack silently lags its own inputs.
"""
import os, glob, datetime

HERE = os.path.dirname(os.path.abspath(__file__))        # recipes/


def _repo_root(start):
    """Walk up until we find the checkout root.  sits at the root in the published
    layout but under  in some working copies, so parent-of-here is not reliable."""
    d = start
    while True:
        if os.path.isdir(os.path.join(d, ".claude")):
            return d
        parent = os.path.dirname(d)
        if parent == d:
            return os.path.abspath(os.path.join(start, ".."))   # fall back to parent-of-here
        d = parent


ROOT = _repo_root(HERE)
OUT = os.path.join(HERE, "DESIGN-CONTEXT.md")

# Each source lists candidate paths so the script works in the published layout (recipes/ at the root)
# and in a working checkout that still nests them under strata/. First hit wins.
SOURCES = [
    ("The Component Manifest — every widget, node, binding, trigger/action, theme key (+ §10 freestyle charter)",
     ["recipes/COMPONENT-MANIFEST.md", "recipes/COMPONENT-MANIFEST.md"]),
    ("Application design guideline — process, silhouettes, layout/wiring/theme rules, tiers, checklist",
     ["strata/docs/guide/app-design.md"]),
    ("Component inventory — what exists and its status (shipped / partial / backend / planned)",
     ["strata/docs/reference/components.md"]),
    ("Recipe anatomy — the contract a recipe must satisfy, and the Template: protocol",
     ["recipes/README.md", "recipes/README.md"]),
    ("The serialized template roster — AppLayout JSONs shipped in strata/templates/",
     ["strata/templates/README.md"]),
]

EXAMPLES = [  # concrete AppLayout serializations, fenced as JSON
    ("Example A — a wired dashboard template (monitor)", ["strata/templates/monitor.json"]),
    ("Example B — a floating-dock template with windows + controller (launchpad)",
     ["strata/templates/launchpad.json"]),
    ("Example C — the kitchen-sink showcase AppLayout (every capability)",
     ["recipes/showcase/app.json", "recipes/showcase/app.json"]),
]

PREAMBLE = """# DESIGN-CONTEXT — the knowledge pack for bespoke application designs

> **GENERATED — do not edit.** Rebuild with `python recipes/build_design_context.py`.

**Purpose.** Everything Claude needs to produce a **business-bespoke design proposal**, exploiting the
full capability surface of `strata/packages/*`. Attach this file **plus** the target `RECIPE.md` (or a
business brief), and follow `DESIGN-REQUEST-PROMPT.md` in this folder.

**The brief to the model:**

- Design **freestyle under the freestyle charter** (§10 of the Component Manifest, first section below):
  compose bespoke to the business from the **registry widgets and manifest config keys only**. If a needed
  widget does not exist, invoke the **§10.2 escape hatch** — propose it inside the widget contract
  (app-local registry override; props/bus/dataSource/theme rules) **with a named fallback**, documented as
  a §10.3 "New widget" block.
- Obey the design guideline: silhouette first, **≥3 live `connections`**, the signature loop working end
  to end, **verified fields only**, keyless basemaps, EPSG:4326, write paths only on an ESRI backend.
- Stay **distinct** — a new design must not read as a re-skin of a sibling recipe. The silhouettes and the
  visual-differentiation rules are in the template-library section.
- Deliverable shape: purpose sentence · silhouette + ASCII skeleton · `AppLayout` JSON sketch ·
  `connections` table · `ThemeSpec` (with the contrast measurement) · data bindings (layer + field per
  widget) · any "New widget" blocks · which template it descends from, or `open-design`.

**Contents**

"""


def resolve(candidates):
    """First candidate that exists, as an absolute path + its repo-relative form."""
    for rel in candidates:
        p = os.path.join(ROOT, rel)
        if os.path.exists(p):
            return p, rel
    return None, candidates[0]


def main() -> None:
    parts, toc, missing = [], [], []
    n = 0

    def add(title, rel, body, lang=None):
        nonlocal n
        n += 1
        toc.append(f"{n}. **{title}**  — `{rel}`")
        head = f"\n\n---\n\n# PACK §{n} · {title}\n\n> Source: `{rel}`\n\n"
        parts.append(head + (f"```{lang}\n{body.rstrip()}\n```\n" if lang else body.rstrip() + "\n"))

    for title, cands in SOURCES:
        p, rel = resolve(cands)
        if not p:
            missing.append(rel)
            continue
        with open(p, encoding="utf-8") as f:
            add(title, rel, f.read())

    pkg_body = []
    for p in sorted(glob.glob(os.path.join(ROOT, "strata/packages/*/README.md"))):
        rel = os.path.relpath(p, ROOT).replace(os.sep, "/")   # normalise: os.sep splits wrong on Windows
        with open(p, encoding="utf-8") as f:
            pkg_body.append(f"\n\n## {rel.split('/')[2]}  (`{rel}`)\n\n" + f.read().rstrip())
    if pkg_body:
        add("Package READMEs — per-package capability notes (all of strata/packages/*)",
            "strata/packages/*/README.md", "".join(pkg_body))

    for title, cands in EXAMPLES:
        p, rel = resolve(cands)
        if not p:
            missing.append(rel)
            continue
        with open(p, encoding="utf-8") as f:
            add(title, rel, f.read(), lang="jsonc")

    stamp = datetime.date.today().isoformat()
    out = PREAMBLE + "\n".join(toc) + "\n" + "".join(parts) + \
        f"\n\n---\n\n*Generated {stamp} from {n} sections by build_design_context.py.*\n"
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(out)

    print(f"wrote {OUT}: {n} sections, {len(out.splitlines())} lines, {len(out)//1024} KiB")
    for rel in missing:
        print(f"  WARNING: source not found, section skipped — {rel}")


if __name__ == "__main__":
    main()
