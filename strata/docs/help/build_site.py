#!/usr/bin/env python3
"""
build_site.py — generate the strata-app-builder **HTML help site** from the Markdown docs.

WHY THIS EXISTS
  - The `.md` files under `strata/docs/` are the source of truth and are what **Claude** reads.
  - Humans learn better from a linked, styled website, so this script renders those same `.md`
    files into a **tabaqat-branded** static HTML site under `strata/docs/help/`.
  - The HTML is a GENERATED ARTIFACT. Edit the Markdown, then re-run this script — never hand-edit
    the generated `*.html` (your changes would be overwritten).

USAGE
  pip install --user markdown        # one-time (the only dependency)
  python3 strata/docs/help/build_site.py

  Open strata/docs/help/index.html in a browser.

ADD / REMOVE A TOPIC
  Edit the TOPICS list below (section, title, path). Content changes to existing pages need no code
  change — just re-run. See strata/docs/HELP-SITE.md for the full policy.
"""
import os, re, html, sys

HERE = os.path.dirname(os.path.abspath(__file__))
DOCS = os.path.abspath(os.path.join(HERE, ".."))          # strata/docs
SITE = HERE                                               # strata/docs/help

# ---- the site map: (section, title, path-relative-to-docs) in reading order ----
TOPICS = [
    ("Start here", "Overview",              "README.md"),
    ("Start here", "Getting started",       "getting-started.md"),
    ("Start here", "FAQ",                   "faq.md"),
    ("Guide",      "Repository anatomy",    "guide/anatomy.md"),
    ("Guide",      "Sample map templates",  "guide/map-templates.md"),
    ("Guide",      "The style compiler",    "guide/style-compiler.md"),
    ("Guide",      "Creating components",   "guide/creating-components.md"),
    ("Guide",      "Application design",    "guide/app-design.md"),
    ("How-to",     "Create an app layout",  "how-to/create-app-layouts.md"),
    ("How-to",     "Symbology",             "how-to/symbology.md"),
    ("How-to",     "Publish data",          "how-to/publish-data.md"),
    ("How-to",     "Export maps",           "how-to/export-maps.md"),
    ("How-to",     "CORS & proxy",          "how-to/cors-and-proxy.md"),
    ("How-to",     "Using recipes",         "how-to/using-recipes.md"),
    ("Reference",  "Components & widgets",  "reference/components.md"),
    ("Reference",  "Human Language Reference", "reference/human-language.md"),
    ("Reference",  "Command reference",     "reference/commands.md"),
    ("Reference",  "Troubleshooting",       "troubleshooting.md"),
]
TAGLINE = {
    "README.md": "What strata-app-builder is, and where to go next.",
    "getting-started.md": "From install to your first working map — the on-ramp.",
    "faq.md": "The questions people actually ask.",
    "guide/anatomy.md": "What every folder and package is.",
    "guide/map-templates.md": "The four starter maps first run drops onto your canvas.",
    "guide/style-compiler.md": "How genuine ESRI drawingInfo becomes MapLibre paint.",
    "guide/creating-components.md": "Prerequisites + the recipe for a new widget, panel, plugin, or package.",
    "guide/app-design.md": "Silhouette, layout, wiring, theme — how to design a distinct, alive app.",
    "how-to/create-app-layouts.md": "Full-page, in-scroll, split, and synced multi-map.",
    "how-to/symbology.md": "Style layers with simple / class-breaks / unique-value / heatmap.",
    "how-to/publish-data.md": "Convert to GeoParquet and publish to the Strata Serve server.",
    "how-to/export-maps.md": "Image, PDF, shareable web-map spec, and layer data.",
    "how-to/cors-and-proxy.md": "Blank layers are usually CORS — here's the fix.",
    "how-to/using-recipes.md": "Launch a recipe like an ArcGIS Instant App: wizard → build.",
    "reference/components.md": "Purpose and scope of every package, panel, widget, and skill.",
    "reference/human-language.md": "The phrase to ask for each component — recipe fuel.",
    "reference/commands.md": "Every .claude command, grouped.",
    "troubleshooting.md": "Known traps and how to avoid them.",
}
TOPIC_PATHS = {t[2] for t in TOPICS}

def slug(relpath: str) -> str:
    return relpath[:-3].replace("/", "-") + ".html" if relpath.endswith(".md") else relpath

# ---------- brand ----------
WORDMARK = ('<svg class="mk" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
            '<rect x="6" y="7" width="20" height="4.2" rx="2.1" fill="#0c2b38"/>'
            '<rect x="4" y="14" width="24" height="4.2" rx="2.1" fill="#1ba7a6"/>'
            '<rect x="8" y="21" width="16" height="4.2" rx="2.1" fill="#5cc7c5"/></svg>')

CSS = """
:root{--navy:#0c2b38;--navy2:#123c4d;--teal:#1ba7a6;--teal600:#178f8e;--teal50:#e9f7f7;
--ink:#12303c;--slate:#5b6b76;--slate400:#94a3b8;--line:#e4ebee;--panel:#f6f9fa;--white:#fff;
--code-bg:#f4f7f8;--font:'Segoe UI',system-ui,-apple-system,Roboto,Helvetica,Arial,sans-serif;
--mono:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;font-family:var(--font);color:var(--ink);background:var(--white);line-height:1.6}
a{color:var(--teal600);text-decoration:none}
a:hover{text-decoration:underline}
/* top bar */
.top{position:sticky;top:0;z-index:20;height:58px;display:flex;align-items:center;gap:14px;
padding:0 20px;background:var(--navy);color:#fff}
.top .mk{width:26px;height:26px}
.top .brand{display:flex;align-items:center;gap:10px;font-weight:800;letter-spacing:.01em}
.top .brand b{color:#fff}.top .brand span{color:var(--teal);font-weight:700}
.top .brand small{color:#9fc7cd;font-weight:600;margin-left:6px;font-size:.8rem;letter-spacing:.04em}
.top .spacer{flex:1}
.top .home{color:#cfe6e6;font-size:.9rem}
.filter{display:flex;align-items:center}
.filter input{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.22);color:#fff;
border-radius:8px;padding:.4rem .7rem;font-size:.85rem;width:190px;outline:none}
.filter input::placeholder{color:#9fc7cd}
/* layout */
.wrap{display:grid;grid-template-columns:270px minmax(0,1fr);max-width:1200px;margin:0 auto}
nav.side{border-right:1px solid var(--line);padding:22px 14px 60px;height:calc(100vh - 58px);
position:sticky;top:58px;overflow:auto}
nav.side .grp{font-size:.72rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;
color:var(--slate400);margin:18px 10px 6px}
nav.side a{display:block;padding:.4rem .7rem;border-radius:8px;color:var(--ink);font-size:.92rem;font-weight:500}
nav.side a:hover{background:var(--panel);text-decoration:none}
nav.side a.active{background:var(--teal50);color:var(--teal600);font-weight:700}
/* content */
main{padding:34px 44px 80px;min-width:0;max-width:860px}
main .crumb{font-size:.78rem;letter-spacing:.08em;text-transform:uppercase;color:var(--teal600);font-weight:800}
main h1{font-size:2.15rem;line-height:1.15;color:var(--navy);letter-spacing:-.02em;margin:.2rem 0 .2rem}
main .lede{color:var(--slate);font-size:1.05rem;margin:0 0 1.4rem}
main h2{font-size:1.5rem;color:var(--navy);margin:2rem 0 .6rem;padding-top:.4rem;border-top:1px solid var(--line)}
main h3{font-size:1.16rem;color:var(--navy2);margin:1.4rem 0 .4rem}
main h4{font-size:1rem;color:var(--navy2);margin:1.1rem 0 .3rem}
main p,main li{color:#243b45}
main code{font-family:var(--mono);font-size:.88em;background:var(--code-bg);color:#0a3a44;
padding:.12em .38em;border-radius:5px}
main pre{background:var(--code-bg);border:1px solid var(--line);border-radius:10px;padding:14px 16px;
overflow:auto}
main pre code{background:none;padding:0;color:#123}
main table{border-collapse:collapse;width:100%;margin:1rem 0;font-size:.92rem;display:block;overflow:auto}
main th,main td{border:1px solid var(--line);padding:.5rem .7rem;text-align:left;vertical-align:top}
main thead th{background:var(--panel);color:var(--navy);font-size:.82rem;letter-spacing:.02em}
main blockquote{margin:1.1rem 0;padding:.7rem 1rem;background:var(--teal50);border-radius:0 10px 10px 0;
border-left:4px solid var(--teal);color:#134}
main blockquote p{margin:.3rem 0}
main hr{border:none;border-top:1px solid var(--line);margin:2rem 0}
main ul,main ol{padding-left:1.3rem}main li{margin:.25rem 0}
.pager{display:flex;justify-content:space-between;gap:12px;margin-top:3rem;border-top:1px solid var(--line);padding-top:1.2rem}
.pager a{flex:1;padding:.8rem 1rem;border:1px solid var(--line);border-radius:12px;font-weight:600}
.pager a:hover{border-color:var(--teal);background:var(--teal50);text-decoration:none}
.pager a.next{text-align:right}
.pager small{display:block;color:var(--slate400);font-weight:700;font-size:.7rem;letter-spacing:.08em;text-transform:uppercase}
footer{border-top:1px solid var(--line);color:var(--slate400);font-size:.8rem;padding:22px 44px;max-width:860px}
/* landing */
.hero{background:linear-gradient(135deg,var(--navy),#164a5c);color:#fff;border-radius:18px;padding:40px 40px}
.hero h1{color:#fff;font-size:2.4rem;margin:.4rem 0 .5rem;letter-spacing:-.02em}
.hero p{color:#cfe6e6;font-size:1.1rem;max-width:44ch;margin:0}
.hero .mk{width:34px;height:34px;vertical-align:middle}
.cards{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:22px}
.card{border:1px solid var(--line);border-radius:14px;padding:16px 18px;display:block;color:inherit}
.card:hover{border-color:var(--teal);background:var(--teal50);text-decoration:none}
.card b{color:var(--navy);font-size:1.02rem}
.card p{color:var(--slate);font-size:.9rem;margin:.3rem 0 0}
.sec-h{font-size:.75rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--teal600);margin:26px 0 4px}
.menu-btn{display:none}
@media(max-width:860px){
 .wrap{grid-template-columns:1fr}
 nav.side{position:fixed;left:0;top:58px;bottom:0;width:280px;background:#fff;transform:translateX(-100%);
 transition:.2s;box-shadow:0 10px 40px rgba(0,0,0,.15)}
 nav.side.open{transform:none}
 .menu-btn{display:inline-flex}.filter{display:none}
 main{padding:24px 20px 60px}.cards{grid-template-columns:1fr}.hero{padding:28px 22px}
}
"""

def nav_html(active_path):
    out=['<nav class="side" id="side">']
    last=None
    for section,title,path in TOPICS:
        if section!=last:
            out.append(f'<div class="grp">{html.escape(section)}</div>'); last=section
        cls=" active" if path==active_path else ""
        out.append(f'<a class="nav-link{cls}" data-title="{html.escape(title.lower())}" href="{slug(path)}">{html.escape(title)}</a>')
    out.append("</nav>")
    return "\n".join(out)

def shell(active_path, crumb, body, title):
    site_title=f"{title} · strata-app-builder help"
    top=(f'<header class="top"><button class="menu-btn" onclick="document.getElementById(\'side\').classList.toggle(\'open\')" '
         f'aria-label="Menu" style="background:none;border:none;color:#fff;font-size:1.3rem;cursor:pointer">☰</button>'
         f'<a class="brand" href="index.html">{WORDMARK}<b>tabaqat</b><span>· Strata</span><small>HELP &amp; DOCS</small></a>'
         f'<div class="spacer"></div>'
         f'<div class="filter"><input id="q" type="search" placeholder="Filter topics…" oninput="filterNav(this.value)"></div>'
         f'<a class="home" href="index.html">Home</a></header>')
    js=("<script>function filterNav(v){v=v.toLowerCase();document.querySelectorAll('.nav-link').forEach(a=>{"
        "a.style.display=a.dataset.title.includes(v)?'block':'none'})}</script>")
    return (f'<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">'
            f'<meta name="viewport" content="width=device-width, initial-scale=1">'
            f'<title>{html.escape(site_title)}</title><style>{CSS}</style></head><body>'
            f'{top}<div class="wrap">{nav_html(active_path)}<main>{body}</main></div>{js}</body></html>')

def rewrite_links(htmltext, page_relpath):
    base=os.path.dirname(page_relpath)
    def repl(m):
        href=m.group(1)
        if href.startswith(("http://","https://","mailto:","#")): return m.group(0)
        frag=""
        if "#" in href: href,frag=href.split("#",1); frag="#"+frag
        if not href: return f'href="{frag}"'
        resolved=os.path.normpath(os.path.join(base,href))
        if resolved in TOPIC_PATHS:
            return f'href="{slug(resolved)}{frag}"'
        # link to a real repo file: make it relative from the site dir
        target=os.path.normpath(os.path.join(DOCS,resolved))
        rel=os.path.relpath(target,SITE)
        return f'href="{rel}{frag}"'
    return re.sub(r'href="([^"]+)"', repl, htmltext)

def main():
    try:
        import markdown
    except ImportError:
        sys.exit("Missing dependency: pip install --user markdown  (then re-run)")
    md=markdown.Markdown(extensions=["extra","tables","fenced_code","sane_lists","toc","admonition"])

    order=[t[2] for t in TOPICS]
    for i,(section,title,path) in enumerate(TOPICS):
        src=os.path.join(DOCS,path)
        if not os.path.exists(src):
            print(f"  ! skip (missing): {path}"); continue
        text=open(src,encoding="utf-8").read()
        # drop the first H1 (we render our own title header)
        text=re.sub(r'^\s*#\s+.*\n','',text,count=1)
        md.reset(); bodyhtml=md.convert(text)
        bodyhtml=rewrite_links(bodyhtml,path)
        lede=TAGLINE.get(path,"")
        head=(f'<div class="crumb">{html.escape(section)}</div><h1>{html.escape(title)}</h1>'
              +(f'<p class="lede">{html.escape(lede)}</p>' if lede else ""))
        # prev/next
        pager='<div class="pager">'
        if i>0:
            p=TOPICS[i-1]; pager+=f'<a class="prev" href="{slug(p[2])}"><small>Previous</small>{html.escape(p[1])}</a>'
        else: pager+='<span></span>'
        if i<len(TOPICS)-1:
            n=TOPICS[i+1]; pager+=f'<a class="next" href="{slug(n[2])}"><small>Next</small>{html.escape(n[1])}</a>'
        else: pager+='<span></span>'
        pager+='</div>'
        footer=('<footer>Generated from the Markdown in <code>strata/docs/</code> — edit the '
                'Markdown and re-run <code>build_site.py</code>. Strata is an independent, unaffiliated '
                'interoperability product; ArcGIS®, Esri® are trademarks of Esri, used nominatively.</footer>')
        out=shell(path,section,head+bodyhtml+pager+footer,title)
        open(os.path.join(SITE,slug(path)),"w",encoding="utf-8").write(out)
        print(f"  ✓ {slug(path)}")

    # landing page
    cards={}
    for section,title,path in TOPICS:
        cards.setdefault(section,[]).append((title,path))
    body=[f'<div class="hero">{WORDMARK} <span style="font-weight:800;letter-spacing:.14em;font-size:.8rem;color:#7fd6d4">STRATA-CORE · HELP &amp; DOCS</span>'
          f'<h1>Build ArcGIS-compatible map apps — by describing them.</h1>'
          f'<p>Everything you need to go from an empty folder to a working, sovereign GIS app on Strata or an ArcGIS Server. Start with the guide, or jump to a task.</p></div>']
    for section in ["Start here","Guide","How-to","Reference"]:
        body.append(f'<div class="sec-h">{section}</div><div class="cards">')
        for title,path in cards.get(section,[]):
            body.append(f'<a class="card" href="{slug(path)}"><b>{html.escape(title)}</b>'
                        f'<p>{html.escape(TAGLINE.get(path,""))}</p></a>')
        body.append('</div>')
    open(os.path.join(SITE,"index.html"),"w",encoding="utf-8").write(
        shell("__index__","",("\n".join(body)),"Help & Docs"))
    print("  ✓ index.html")
    print(f"\nDone → open {os.path.join(SITE,'index.html')}")

if __name__=="__main__":
    main()
